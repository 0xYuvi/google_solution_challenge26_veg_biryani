-- Allow phone-first accounts alongside email and Google identities
ALTER TYPE "AuthProvider" ADD VALUE 'PHONE';

ALTER TABLE "User"
ALTER COLUMN "email" DROP NOT NULL,
ADD COLUMN "phone" TEXT;

CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
