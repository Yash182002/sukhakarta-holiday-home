fetch("http://localhost:3000/api/cron/vitals", {
  headers: {
    Authorization: "Bearer 41b82ca6c907cb81338e6c72d62a3eb71cf7314ee8f32ca413e96c31abd6623a"
  }
})
  .then(res => res.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(err => console.error("Error:", err));