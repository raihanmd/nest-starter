-- CreateTable
CREATE TABLE "login_tokens" (
    "token" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "used" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "login_tokens_pkey" PRIMARY KEY ("token")
);
