fetch("https://sukhakartaholidayhome.in/api/cron/vitals", {
  headers: {
    Authorization: "f6d7b98a4945b0e485d6b24999ad296ebfc03634da6f45b06475823efe266cb9"
  }
})
  .then(res => res.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(err => console.error("Error:", err));