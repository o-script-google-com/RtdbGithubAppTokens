function doGet(e) {
  let id = '';
  let access_token = '';
  try {
    try { id = e.parameter.id; } catch { }
    if (id !== '' && existsField(options, id)) {
      access_token = new GithubAuth(options[id]).getAccessToken();
    }
  } catch (error) {
    output.error = error;
  }
  return ContentService.createTextOutput(access_token).setMimeType(ContentService.MimeType.TEXT);
}
