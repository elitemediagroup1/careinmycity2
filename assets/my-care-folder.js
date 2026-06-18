
window.CIMC_MyCareFolder={
 profileKey:"careinmycity_care_profile_starter",
 accountKey:"careinmycity_demo_account",
 isLoggedIn(){return Boolean(localStorage.getItem(this.accountKey));},
 getAccount(){try{return JSON.parse(localStorage.getItem(this.accountKey)||"null")}catch{return null}},
 signIn(email){const account={email:String(email||"").trim(),createdAt:new Date().toISOString(),mode:"local-demo"};localStorage.setItem(this.accountKey,JSON.stringify(account));return account},
 signOut(){localStorage.removeItem(this.accountKey)},
 saveCareProfile(payload){const existing=this.getCareProfile()||{};const merged={...existing,...payload,updatedAt:new Date().toISOString()};localStorage.setItem(this.profileKey,JSON.stringify(merged));return merged},
 getCareProfile(){try{return JSON.parse(localStorage.getItem(this.profileKey)||"null")}catch{return null}},
 clearCareProfile(){localStorage.removeItem(this.profileKey)}
};
