import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { IssueService, Issue } from '../services/issue.service';
import { MapPlaceholderComponent } from './map-placeholder.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, MapPlaceholderComponent],
  template: `
    <div class="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-emerald-500/30">
      
      <!-- Top Navigation -->
      <nav class="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Command Center</h1>
          </div>
          
          <div class="flex items-center gap-6">
            <div class="hidden md:flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span class="text-sm font-medium text-slate-300">{{ userEmail }}</span>
            </div>
            <button
              (click)="logout()"
              class="group relative inline-flex items-center justify-center px-6 py-2.5 font-semibold text-white transition-all duration-200 bg-rose-500/10 border border-rose-500/20 rounded-xl hover:bg-rose-500 hover:shadow-lg hover:shadow-rose-500/20"
            >
              <span class="mr-2 group-hover:-translate-x-1 transition-transform">Logout</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </nav>

      <!-- Main Content Container -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <!-- Welcome Banner -->
        <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/20 p-8 sm:p-10 mb-8">
          <div class="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl mix-blend-screen"></div>
          
          <div class="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h2 class="text-3xl sm:text-4xl font-extrabold text-white mb-2">System Online, Commander.</h2>
              <p class="text-emerald-100/70 text-lg">Firebase authenticated. PostgreSQL synced. AI Pipeline active.</p>
            </div>
            <div class="px-5 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-md flex items-center gap-3">
              <span class="relative flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span class="text-emerald-400 font-semibold text-sm uppercase tracking-wider">All Systems Nominal</span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          <!-- Intelligence Report Form -->
          <div class="lg:col-span-1 flex flex-col gap-6">
            <div class="p-8 rounded-3xl bg-slate-800/40 border border-white/5 backdrop-blur-xl relative overflow-hidden group">
              <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/20 transition-colors duration-500"></div>
              
              <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <div class="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                </div>
                Report Intelligence
              </h3>

              <div class="space-y-4">
                <div class="relative">
                  <textarea
                    [(ngModel)]="reportText"
                    placeholder="Describe the community need or issue (e.g., 'Broken water pipe near sector 4')..."
                    rows="4"
                    class="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all resize-none"
                  ></textarea>
                </div>

                <button
                  (click)="submitReport()"
                  [disabled]="isSubmitting || !reportText.trim()"
                  class="w-full relative group overflow-hidden px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <span class="relative z-10 flex items-center justify-center gap-2">
                    @if (isSubmitting) {
                      <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing via Gemini...
                    } @else {
                      Send Intelligence
                      <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    }
                  </span>
                </button>
              </div>
            </div>

            <!-- Stats Card -->
            <div class="p-6 rounded-3xl bg-slate-800/20 border border-white/5 flex items-center justify-between">
              <div>
                <p class="text-slate-500 text-sm font-medium uppercase tracking-widest mb-1">Total Issues</p>
                <p class="text-3xl font-black text-white">{{ issues.length }}</p>
              </div>
              <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              </div>
            </div>
          </div>

          <!-- Recent Intelligence Feed -->
          <div class="lg:col-span-2 space-y-6">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-xl font-bold text-white flex items-center gap-3">
                Recent Intelligence
                <span class="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase border border-indigo-500/20">Live</span>
              </h3>
              <button (click)="loadIssues()" class="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                Refresh
              </button>
            </div>

            @if (isLoading) {
              <div class="flex flex-col items-center justify-center py-20 space-y-4">
                <div class="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                <p class="text-slate-500 font-medium">Scanning network for updates...</p>
              </div>
            } @else if (issues.length === 0) {
              <div class="p-12 rounded-3xl border-2 border-dashed border-white/5 bg-white/5 flex flex-col items-center text-center">
                <div class="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-6 text-slate-600">
                  <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                </div>
                <h4 class="text-xl font-bold text-white mb-2">No active reports found</h4>
                <p class="text-slate-500 max-w-xs">The intelligence feed is currently empty. Use the form on the left to report a new community issue.</p>
              </div>
            } @else {
              <div class="grid grid-cols-1 gap-4">
                @for (issue of issues; track issue.id) {
                  <div class="group p-6 rounded-3xl bg-slate-800/40 border border-white/5 hover:border-emerald-500/30 transition-all duration-300">
                    <div class="flex flex-col sm:flex-row justify-between gap-4">
                      <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                          <span class="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                            {{ issue.category }}
                          </span>
                          <span class="text-slate-500 text-[10px]">{{ issue.createdAt | date:'shortTime' }}</span>
                        </div>
                        <h4 class="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">{{ issue.title }}</h4>
                        <p class="text-slate-400 text-sm line-clamp-2 leading-relaxed mb-4">{{ issue.description }}</p>
                        <div class="flex items-center gap-4 text-xs font-medium text-slate-500">
                          <span class="flex items-center gap-1.5">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            {{ issue.city }}
                          </span>
                        </div>
                      </div>
                      <div class="flex flex-col items-end justify-between min-w-[100px]">
                        <div class="text-right">
                          <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Urgency</p>
                          <div class="flex gap-1">
                            @for (i of [1,2,3,4,5]; track i) {
                              <div [class]="'w-3 h-1.5 rounded-full ' + (i <= issue.urgency ? 'bg-orange-500 shadow-sm shadow-orange-500/40' : 'bg-slate-700')"></div>
                            }
                          </div>
                        </div>
                        <span [class]="'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ' + (issue.status === 'OPEN' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400')">
                          {{ issue.status }}
                        </span>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- System Status Grid (Reduced) -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Auth Status -->
          <div class="group p-6 rounded-3xl bg-slate-800/30 border border-slate-700/50 hover:border-indigo-500/50 transition-all duration-300">
            <div class="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg class="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            </div>
            <h3 class="text-sm font-bold text-white mb-1">Identity</h3>
            <p class="text-slate-400 text-[10px]">Auth: <span class="text-indigo-400">{{ authProvider }}</span></p>
          </div>

          <!-- DB Status -->
          <div class="group p-6 rounded-3xl bg-slate-800/30 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300">
            <div class="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg class="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"/></svg>
            </div>
            <h3 class="text-sm font-bold text-white mb-1">Database</h3>
            <p class="text-slate-400 text-[10px]">PostGIS: <span class="text-blue-400">Active</span></p>
          </div>

          <!-- API Status -->
          <div class="group p-6 rounded-3xl bg-slate-800/30 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg class="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
            </div>
            <h3 class="text-sm font-bold text-white mb-1">API Core</h3>
            <p class="text-slate-400 text-[10px]">Express + Prisma: <span class="text-emerald-400">Listening</span></p>
          </div>

          <!-- Map Toggle -->
          <div class="group p-6 rounded-3xl bg-slate-800/30 border border-slate-700/50 hover:border-amber-500/50 transition-all duration-300 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg class="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
              </div>
              <h3 class="text-sm font-bold text-white">Tactical Map</h3>
            </div>
            <button (click)="toggleMap()" class="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
              @if (showMap) {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              } @else {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0L2 6m2-2l2 2M14 8V4m0 0l-2 2m2-2l2 2M6 20v-4m0 0l-2 2m2-2l2 2m10 2v-4m0 0l-2 2m2-2l2 2"></path></svg>
              }
            </button>
          </div>
        </div>

        <!-- Map Area -->
        @if (showMap) {
          <div class="mb-8 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl shadow-black/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div class="bg-slate-800/80 px-6 py-4 border-b border-slate-700 flex justify-between items-center backdrop-blur-md">
              <div class="flex items-center gap-3">
                <span class="flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <h3 class="text-white font-semibold">Live Event Radar</h3>
              </div>
              <button (click)="toggleMap()" class="text-slate-400 hover:text-white transition-colors">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div class="bg-slate-900 h-[500px]">
              <app-map-placeholder [showCloseButton]="false"></app-map-placeholder>
            </div>
          </div>
        }

        <!-- Identity Metrics -->
        <div class="rounded-3xl bg-slate-800/20 border border-white/5 p-6 md:p-8 backdrop-blur-sm">
          <h3 class="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <svg class="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
            Session Details
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-slate-900/50 rounded-2xl p-5 border border-white/5">
              <p class="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">User Identifier</p>
              <p class="text-slate-300 font-mono text-sm break-all">{{ userUid }}</p>
            </div>
            <div class="bg-slate-900/50 rounded-2xl p-5 border border-white/5">
              <p class="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Access Level</p>
              <p class="text-emerald-400 font-semibold flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                Administrator
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private issueService = inject(IssueService);
  private router = inject(Router);

  userEmail = '';
  userUid = '';
  authProvider = '';
  showMap = false;
  
  reportText = '';
  isSubmitting = false;
  isLoading = false;
  issues: Issue[] = [];

  ngOnInit() {
    this.loadIssues();
  }

  constructor() {
    const user = this.authService.getCurrentUser();
    this.userEmail = user?.email || 'Unknown';
    this.userUid = user?.uid || 'Unknown';
    
    user?.getIdTokenResult().then((result: any) => {
      this.authProvider = result.claims.firebase?.sign_in_provider === 'google.com' ? 'Google OAuth' : 'Email';
    }).catch(() => {
      this.authProvider = 'Email/Google';
    });
  }

  loadIssues() {
    this.isLoading = true;
    this.issueService.getIssues().subscribe({
      next: (data) => {
        this.issues = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load issues:', err);
        this.isLoading = false;
      }
    });
  }

  submitReport() {
    if (!this.reportText.trim()) return;

    this.isSubmitting = true;
    
    // Default location for the prototype (can be enhanced with Geolocation API)
    const location = { lat: 19.076, lng: 72.8777, city: 'Mumbai' };

    this.issueService.reportIssue(this.reportText, location).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.reportText = '';
        this.loadIssues(); // Refresh the list
      },
      error: (err) => {
        console.error('Report failed:', err);
        this.isSubmitting = false;
        alert('AI processing failed. Please check your Gemini API key and try again.');
      }
    });
  }

  toggleMap() {
    this.showMap = !this.showMap;
  }

  async logout() {
    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error: any) {
      console.error('Logout failed:', error);
    }
  }
}
