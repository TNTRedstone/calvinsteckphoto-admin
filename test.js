const results = await fetch('http://localhost:5173/api/send-paypal-request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: "calvinsteckphoto@gmail.com",
        numberOfPhotos: 6
    })
});

console.log(results)