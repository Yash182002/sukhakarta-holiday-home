<<<<<<< HEAD
fetch("https://sukhakartaholidayhome.in/api/cron/vitals, {
=======
fetch("https://sukhakartaholidayhome.in/api/cron/vitals", {
>>>>>>> cb57961 (Update dependencies and test cron script)
  headers: {
    Authorization: "Bearer YOUR_NEW_SECRET_HERE"
  }
})
  .then(res => res.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(err => console.error("Error:", err));
