/**
 * Node-RED settings for Railway (aalfath/node-red-railway-template).
 *
 * Variables:
 *   NODE_RED_ADMIN_USER          editor login name (default "admin")
 *   NODE_RED_ADMIN_PASSWORD      editor password: plain text (hashed at start-up) or a bcrypt hash ($2a$/$2b$/$2y$)
 *   NODE_RED_CREDENTIAL_SECRET   key that encrypts credentials stored in flows_cred.json
 *   PORT                         HTTP port (Railway sets the domain target to it)
 *
 * The editor never starts without a password, so it is never open to the internet.
 * Full option list: https://nodered.org/docs/user-guide/runtime/settings-file
 */
// bcryptjs ships with Node-RED; resolve it from the image even when this file lives on the volume.
const bcrypt = require(require.resolve("bcryptjs", { paths: [__dirname, "/usr/src/node-red"] }));

const adminUser = (process.env.NODE_RED_ADMIN_USER || "admin").trim();
const adminPassword = process.env.NODE_RED_ADMIN_PASSWORD || "";

if (!adminPassword) {
    console.error("[railway] NODE_RED_ADMIN_PASSWORD is empty. Refusing to start an editor without a login.");
    process.exit(1);
}

const isBcryptHash = /^\$2[aby]\$\d{2}\$.{53}$/.test(adminPassword);
const passwordHash = isBcryptHash ? adminPassword : bcrypt.hashSync(adminPassword, 10);

const settings = {
    uiPort: process.env.PORT || 1880,

    // Everything below lives in userDir (/data), which is the Railway volume.
    flowFile: "flows.json",
    flowFilePretty: true,

    adminAuth: {
        type: "credentials",
        users: [{ username: adminUser, password: passwordHash, permissions: "*" }]
    },

    diagnostics: { enabled: true, ui: true },
    runtimeState: { enabled: false, ui: false },
    logging: { console: { level: "info", metrics: false, audit: false } },
    exportGlobalContextKeys: false,
    externalModules: {},
    editorTheme: {
        palette: {},
        projects: { enabled: false, workflow: { mode: "manual" } },
        codeEditor: { lib: "monaco", options: {} },
        markdownEditor: { mermaid: { enabled: true } },
        multiplayer: { enabled: false }
    },
    functionExternalModules: true,
    functionTimeout: 0,
    functionGlobalContext: {},
    debugMaxLength: 1000,
    mqttReconnectTime: 15000,
    serialReconnectTime: 15000
};

if (process.env.NODE_RED_CREDENTIAL_SECRET) {
    settings.credentialSecret = process.env.NODE_RED_CREDENTIAL_SECRET;
}

module.exports = settings;
