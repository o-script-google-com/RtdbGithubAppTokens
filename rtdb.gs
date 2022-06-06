const parseResponse = (response) => {
  try {
    return JSON.parse(response.getContentText());
  } catch {
    return response.getContentText();
  }
}
const existsField = (data, field) => {
  try { return field in data; } catch { }
  return false;
}
class GithubAuth {
  constructor({ authUrl = '', client_id = '', client_secret = '', redirect_uri = '', refresh_token = '', access_token = '',
    storeFields = []
  } = {}) {
    this.authUrl = authUrl || '';
    this.client_id = client_id || '';
    this.client_secret = client_secret || '';
    this.redirect_uri = redirect_uri || '';
    this.refresh_token = refresh_token || '';
    this.access_token = access_token || '';
    this.storeFields = storeFields || [];
  }
  getAccessToken() {
    const refeshDataBy = (data) => {
      this.storeFields.forEach(field => { if (existsField(data, field)) this[field] = data[field]; });
    }
    try {
      refeshDataBy(parseResponse(UrlFetchApp.fetch(this.authUrl, { muteHttpExceptions: true, method: 'GET' })));
      if (existsField(this, 'create_at')) {
        let expires_at = Number(this['create_at']) + Number(this['expires_in']);
        let now_at = Math.round(new Date().getTime() / 1000);
        if (expires_at > (now_at + (1 * 60 * 5))) {
          return this['access_token'];
        }
      }
      let tokenUri = `https://github.com/login/oauth/access_token?client_id=${this.client_id}&client_secret=${this.client_secret}&refresh_token=${this.refresh_token}&redirect_uri=${this.redirect_uri}&grant_type=refresh_token`;
      let token = parseResponse(UrlFetchApp.fetch(tokenUri, {
        muteHttpExceptions: true, method: 'POST', headers: {
          Accept: 'application/vnd.github.v3+json'
        }
      }));
      refeshDataBy(token)
      try {
        if (existsField(token, 'access_token')) {
          this.create_at = Math.round(new Date().getTime() / 1000);
          let rtdbData = this.storeFields.reduce((total, field) => { total[field] = this[field]; return total; }, {});
          UrlFetchApp.fetch(this.authUrl, {
            muteHttpExceptions: true, method: 'PATCH',
            payload: JSON.stringify(rtdbData)
          });
        }
      } catch { }
      return this['access_token'];
    } catch (error) {
      throw error;
    }
  }
}
function timer() {
  Object.keys(options).forEach(key => {
    console.log({ key, getAccessToken: new GithubAuth(options[key]).getAccessToken() })
  });
}
