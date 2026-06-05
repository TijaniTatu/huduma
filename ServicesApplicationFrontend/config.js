// Central network configuration for the Huduma mobile app.
//
// During development these must point at your machine's LAN IP (not localhost),
// because the app runs on a physical device / emulator. Update the IP below to
// match your dev machine, or wire these to environment variables / app.json
// `extra` for per-build configuration.

export const API_URL = 'http://192.168.100.91:3000'; // Express backend (Server/)
export const PAYMENT_URL = 'http://192.168.100.146:4000'; // M-Pesa "lipa" service
