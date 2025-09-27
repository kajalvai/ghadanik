// index.html form submission
const form = document.getElementById("infoForm");
const successMsg = document.querySelector(".success");

if(form){
  form.addEventListener("submit", function(e){
    e.preventDefault();
    const formData = new FormData(form);
    let data = {};
    formData.forEach((value, key) => { 
      if (key !== "images") data[key] = value; 
    });

    const files = document.getElementById("images").files;
    let promises = [];
    for (let i = 0; i < files.length; i++) {
      promises.push(new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(files[i]);
      }));
    }

    Promise.all(promises).then(imagesBase64 => {
      data["images"] = imagesBase64; 

      fetch("https://sheetdb.io/api/v1/YOUR_SHEETDB_API_URL", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: data })
      })
      .then(response => response.json())
      .then(() => {
        successMsg.style.display = "block";
        form.reset();
        setTimeout(() => { successMsg.style.display = "none"; }, 4000);
      })
      .catch(error => alert("⚠️ জমা দিতে সমস্যা হয়েছে!"));
    });
  });
}

// admin.html card + lightbox
const cardContainer = document.getElementById("cardContainer");
if(cardContainer){
  fetch("https://sheetdb.io/api/v1/YOUR_SHEETDB_API_URL")
    .then(response => response.json())
    .then(rows => {
      cardContainer.innerHTML = "";
      rows.forEach(row => {
        let imagesHTML = "";
        if(row.images){
          try{
            const imagesArray = JSON.parse(row.images);
            imagesArray.forEach(img => {
              imagesHTML += `<img src="${img}" onclick="openLightbox('${img}')">`;
            });
          } catch(e){ imagesHTML = "ছবি লোড হয়নি"; }
        }

        const cardHTML = `
          <div class="card">
            <h3>${row.category || ""}</h3>
            <p>${row.details || ""}</p>
            <div>${imagesHTML}</div>
            <p>${row.media ? `<a class="media-link" href="${row.media}" target="_blank">ভিডিও/অডিও লিঙ্ক</a>` : ""}</p>
            <p><strong>নাম:</strong> ${row.name || ""}</p>
          </div>
        `;
        cardContainer.innerHTML += cardHTML;
      });
    })
    .catch(err => {
      cardContainer.innerHTML = `<p style="text-align:center;color:red;">ডেটা লোড করতে সমস্যা হয়েছে!</p>`;
      console.error(err);
    });
}

// Lightbox function
function openLightbox(src){
  const lightbox = document.getElementById("lightbox");
  const img = document.getElementById("lightbox-img");
  img.src = src;
  lightbox.style.display = "flex";
}
