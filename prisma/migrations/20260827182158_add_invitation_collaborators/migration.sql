-- CreateTable
CREATE TABLE "InvitationCollaborator" (
    "id" TEXT NOT NULL,
    "invitationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvitationCollaborator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InvitationCollaborator_userId_idx" ON "InvitationCollaborator"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "InvitationCollaborator_invitationId_userId_key" ON "InvitationCollaborator"("invitationId", "userId");

-- AddForeignKey
ALTER TABLE "InvitationCollaborator" ADD CONSTRAINT "InvitationCollaborator_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitationCollaborator" ADD CONSTRAINT "InvitationCollaborator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
