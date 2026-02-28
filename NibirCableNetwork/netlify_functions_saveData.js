const CLIENT_ID = "640107322067-vl1764bl5shu86bq6c3n2ruoad8imomm.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/drive.file";

async function loadGapi() {
  return new Promise((res) => {
    const s = document.createElement("script");
    s.src = "https://apis.google.com/js/api.js";
    s.onload = res;
    document.body.appendChild(s);
  });
}

async function initDrive() {
  await loadGapi();
  return new Promise((res) => {
    gapi.load("client:auth2", async () => {
      await gapi.client.init({ clientId: CLIENT_ID, scope: SCOPES });
      res();
    });
  });
}

async function driveBackup(data) {
  await initDrive();
  const auth = gapi.auth2.getAuthInstance();
  if (!auth.isSignedIn.get()) await auth.signIn();
  const drive = gapi.client.drive;

  const content = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const metadata = {
    name: `nibir_backup_${new Date().toISOString().slice(0, 10)}.json`,
    mimeType: "application/json",
    parents: ["root"],
  };

  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append("file", content);

  await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
    method: "POST",
    headers: new Headers({ Authorization: "Bearer " + auth.currentUser.get().getAuthResponse().access_token }),
    body: form,
  });

  alert("✅ Google Drive-এ ব্যাকআপ সম্পন্ন হয়েছে!");
}
