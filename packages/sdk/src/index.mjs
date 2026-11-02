// Supply a same-origin base URL in browsers, or an absolute API URL on the server.
export function createClient(baseUrl='') {
  async function get(path) {const response=await fetch(baseUrl+path);if(!response.ok) throw new Error('NodePath API: '+response.status);return response.json();}
  return {overview:()=>get('/v1/overview'),wallet:address=>get('/v1/wallets/'+encodeURIComponent(address))};
}

