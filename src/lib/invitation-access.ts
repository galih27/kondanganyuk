import "server-only";
import { db } from "./db";

type AccessUser = { id: string; role: string };

// Cek apakah user (owner / kolaborator / admin) diberi akses mengelola undangan.
// Mengembalikan record undangan bila berhak, atau null bila tidak/belum ada.
export async function findAccessibleInvitation(invitationId: string, user: AccessUser) {
  if (user.role === "ADMIN") {
    return db.invitation.findFirst({ where: { id: invitationId } });
  }
  return db.invitation.findFirst({
    where: {
      id: invitationId,
      OR: [
        { userId: user.id },
        { collaborators: { some: { userId: user.id } } },
      ],
    },
  });
}

// Query `where` untuk mencantumkan undangan milik user ATAU undangan tempat ia kolaborator.
export function ownedOrCollaboratedWhere(userId: string) {
  return {
    OR: [
      { userId },
      { collaborators: { some: { userId } } },
    ],
  };
}
