import QRCode from "qrcode-generator";

type TypeNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export function generateQRCode(data: string, size: number = 4): string {
  const qr = QRCode(size as TypeNumber, "M");
  qr.addData(data);
  qr.make();

  return qr.createDataURL(4);
}

export function generateInviteUrl(token: string): string {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  return `${baseUrl}/invite/accept?token=${token}`;
}