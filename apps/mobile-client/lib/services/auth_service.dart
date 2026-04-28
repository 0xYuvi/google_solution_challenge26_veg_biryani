import 'dart:async';
import 'dart:convert';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:http/http.dart' as http;
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class PhoneCodeRequestResult {
  const PhoneCodeRequestResult({required this.autoVerified});

  final bool autoVerified;

  bool get requiresSmsCode => !autoVerified;
}

class AuthService with ChangeNotifier {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: ['email'],
    serverClientId: dotenv.env['GOOGLE_SIGN_IN_SERVER_CLIENT_ID'],
  );

  Map<String, dynamic>? _profileData;
  Map<String, dynamic>? get profileData => _profileData;
  bool _isProfileLoading = false;
  bool get isProfileLoading => _isProfileLoading;
  String? _pendingPhoneVerificationId;
  String? _pendingPhoneNumber;
  int? _phoneResendToken;

  static String get baseUrl =>
      dotenv.env['API_BASE_URL'] ??
      'https://backend-349232024775.asia-south1.run.app/api/v1';

  AuthService() {
    if (_auth.currentUser != null) {
      unawaited(syncCurrentUser());
    }
  }

  User? get currentUser => _auth.currentUser;
  Stream<User?> get authStateChanges => _auth.authStateChanges();

  Future<UserCredential?> login(String email, String password) async {
    try {
      final credential = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      await syncCurrentUser();
      return credential;
    } catch (e) {
      debugPrint('Login Error: $e');
      rethrow;
    }
  }

  Future<UserCredential?> register(
    String email,
    String password,
    String name,
  ) async {
    try {
      final credential = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      await credential.user?.updateDisplayName(name);
      await credential.user?.reload();
      await syncCurrentUser();
      return credential;
    } catch (e) {
      debugPrint('Register Error: $e');
      rethrow;
    }
  }

  Future<UserCredential?> signInWithGoogle() async {
    try {
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) return null;

      final GoogleSignInAuthentication googleAuth =
          await googleUser.authentication;
      final AuthCredential credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      final userCredential = await _auth.signInWithCredential(credential);
      await syncCurrentUser();
      return userCredential;
    } catch (e) {
      debugPrint('Google Sign In Error: $e');
      rethrow;
    }
  }

  Future<PhoneCodeRequestResult> requestPhoneVerification(
    String phoneNumber, {
    bool resend = false,
  }) async {
    final normalizedPhone = phoneNumber.trim();
    if (normalizedPhone.isEmpty) {
      throw ArgumentError('Phone number is required');
    }

    _pendingPhoneNumber = normalizedPhone;

    final completer = Completer<PhoneCodeRequestResult>();
    await _auth.verifyPhoneNumber(
      phoneNumber: normalizedPhone,
      timeout: const Duration(seconds: 60),
      forceResendingToken: resend ? _phoneResendToken : null,
      verificationCompleted: (credential) async {
        try {
          await _auth.signInWithCredential(credential);
          await syncCurrentUser();
          _clearPhoneVerificationState();
          if (!completer.isCompleted) {
            completer.complete(const PhoneCodeRequestResult(autoVerified: true));
          }
        } catch (error) {
          if (!completer.isCompleted) {
            completer.completeError(error);
          }
        }
      },
      verificationFailed: (error) {
        if (!completer.isCompleted) {
          completer.completeError(error);
        }
      },
      codeSent: (verificationId, resendToken) {
        _pendingPhoneVerificationId = verificationId;
        _phoneResendToken = resendToken;
        notifyListeners();
        if (!completer.isCompleted) {
          completer.complete(const PhoneCodeRequestResult(autoVerified: false));
        }
      },
      codeAutoRetrievalTimeout: (verificationId) {
        _pendingPhoneVerificationId = verificationId;
      },
    );

    return completer.future;
  }

  Future<UserCredential?> verifyPhoneOtp(
    String smsCode, {
    String? fullName,
  }) async {
    final verificationId = _pendingPhoneVerificationId;
    if (verificationId == null) {
      throw StateError('Request an OTP before verifying the code.');
    }

    try {
      final credential = PhoneAuthProvider.credential(
        verificationId: verificationId,
        smsCode: smsCode.trim(),
      );
      final userCredential = await _auth.signInWithCredential(credential);
      final trimmedName = fullName?.trim();
      final currentDisplayName = userCredential.user?.displayName?.trim();

      if (trimmedName != null &&
          trimmedName.isNotEmpty &&
          (currentDisplayName == null || currentDisplayName.isEmpty)) {
        await userCredential.user?.updateDisplayName(trimmedName);
        await userCredential.user?.reload();
      }

      await syncCurrentUser();
      _clearPhoneVerificationState();
      return userCredential;
    } catch (e) {
      debugPrint('Phone OTP Verification Error: $e');
      rethrow;
    }
  }

  Future<void> sendPasswordResetEmail(String email) async {
    await _auth.sendPasswordResetEmail(email: email.trim());
  }

  Future<void> syncCurrentUser() async {
    final user = currentUser;
    if (user == null) {
      _profileData = null;
      _isProfileLoading = false;
      notifyListeners();
      return;
    }

    _isProfileLoading = true;
    notifyListeners();

    try {
      await _syncWithBackend(user);
      await getUserProfile(notifyOnChange: false);
    } finally {
      _isProfileLoading = false;
      notifyListeners();
    }
  }

  Future<void> _syncWithBackend(User? user) async {
    if (user == null) return;

    try {
      final idToken = await user.getIdToken();
      final response = await http.post(
        Uri.parse('$baseUrl/users/sync'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $idToken',
        },
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        debugPrint('Backend Sync Success');
      } else {
        debugPrint(
          'Backend Sync Failed: ${response.statusCode} - ${response.body}',
        );
      }
    } catch (e) {
      debugPrint('Error syncing with backend: $e');
    }
  }

  Future<void> signOut() async {
    await _googleSignIn.signOut();
    await _auth.signOut();
    _clearPhoneVerificationState();
    _profileData = null;
    notifyListeners();
  }

  Future<Map<String, dynamic>?> getUserProfile({
    bool notifyOnChange = true,
  }) async {
    final user = currentUser;
    if (user == null) {
      _profileData = null;
      if (notifyOnChange) {
        notifyListeners();
      }
      return null;
    }

    try {
      final idToken = await user.getIdToken();
      final response = await http.get(
        Uri.parse('$baseUrl/users/me'),
        headers: {'Authorization': 'Bearer $idToken'},
      );

      if (response.statusCode == 200) {
        _profileData = jsonDecode(response.body)['user'];
        if (notifyOnChange) {
          notifyListeners();
        }
        return _profileData;
      } else {
        debugPrint(
          'Profile Fetch Failed: ${response.statusCode} - ${response.body}',
        );
      }
    } catch (e) {
      debugPrint('Error fetching user profile: $e');
    }
    return null;
  }

  Future<bool> updateUserProfile({
    String? name,
    String? city,
    double? lat,
    double? lng,
  }) async {
    final user = currentUser;
    if (user == null) return false;

    try {
      final idToken = await user.getIdToken();
      final response = await http.put(
        Uri.parse('$baseUrl/users/me'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $idToken',
        },
        body: jsonEncode({
          if (name != null) 'name': name,
          if (city != null) 'city': city,
          if (lat != null) 'lat': lat,
          if (lng != null) 'lng': lng,
        }),
      );

      if (response.statusCode == 200) {
        _profileData = jsonDecode(response.body)['user'];
        notifyListeners();
        return true;
      } else {
        debugPrint(
          'Profile Update Failed: ${response.statusCode} - ${response.body}',
        );
      }
    } catch (e) {
      debugPrint('Error updating profile: $e');
    }
    return false;
  }

  Future<bool> updateVolunteerProfile(
    List<String> skills,
    String availability,
  ) async {
    final user = currentUser;
    if (user == null) return false;

    try {
      final idToken = await user.getIdToken();
      final response = await http.post(
        Uri.parse('$baseUrl/users/volunteer-profile'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $idToken',
        },
        body: jsonEncode({
          'skills': skills,
          'availability': availability,
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        await getUserProfile();
        return true;
      } else {
        debugPrint(
          'Volunteer Profile Update Failed: ${response.statusCode} - ${response.body}',
        );
      }
    } catch (e) {
      debugPrint('Error updating volunteer profile: $e');
    }
    return false;
  }

  String getErrorMessage(Object error) {
    if (error is FirebaseAuthException) {
      switch (error.code) {
        case 'invalid-email':
          return 'Enter a valid email address.';
        case 'user-not-found':
        case 'wrong-password':
        case 'invalid-credential':
          return 'Your email or password is incorrect.';
        case 'email-already-in-use':
          return 'That email is already connected to another account.';
        case 'weak-password':
          return 'Use a stronger password with at least 6 characters.';
        case 'network-request-failed':
          return 'Network issue detected. Check your connection and try again.';
        case 'too-many-requests':
          return 'Too many attempts right now. Please wait a moment and retry.';
        case 'account-exists-with-different-credential':
          return 'This email already exists with another sign-in method.';
        case 'invalid-verification-code':
          return 'The OTP you entered is not valid.';
        case 'invalid-verification-id':
        case 'session-expired':
          return 'The OTP session expired. Request a new code and try again.';
        case 'missing-phone-number':
          return 'Enter a valid phone number including the country code.';
        case 'quota-exceeded':
          return 'OTP delivery is temporarily unavailable. Please try again later.';
      }
    }

    if (error is ArgumentError || error is StateError) {
      return error.toString().replaceFirst('Bad state: ', '');
    }

    return 'Something went wrong. Please try again.';
  }

  void _clearPhoneVerificationState() {
    _pendingPhoneVerificationId = null;
    _pendingPhoneNumber = null;
    _phoneResendToken = null;
  }
}
