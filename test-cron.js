fetch("https://sukhakartaholidayhome.in/api/cron/vitals", {
  headers: {
    Authorization: "Bearer YOUR_NEW_SECRET_HERE"
  }
})
  .then(res => res.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(err => console.error("Error:", err));