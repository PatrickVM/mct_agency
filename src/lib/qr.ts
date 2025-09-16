import QRCode from "qrcode-generator";

export function generateQRCode(data: string, size: number = 4): string {
  const qr = QRCode(size, "M");
  qr.addData(data);
  qr.make();

  return qr.createDataURL(4);
}

export function generateInviteUrl(token: string): string {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  return `${baseUrl}/invite/accept?token=${token}`;
}