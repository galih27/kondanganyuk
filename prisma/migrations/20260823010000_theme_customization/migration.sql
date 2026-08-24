-- Tambah pengaturan tema kustom per undangan
ALTER TABLE "Invitation" ADD COLUMN "themeArt" TEXT;
ALTER TABLE "Invitation" ADD COLUMN "themePalette" TEXT;
