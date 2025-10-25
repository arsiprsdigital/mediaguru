  const loginForm = document.getElementById("loginForm");
  const examSection = document.getElementById("examSection");
  const examContainer = document.getElementById("examContainer");
  const timerDisplay = document.getElementById("timer");
  const sidebar = document.getElementById("sidebar");
  const toggleSidebar = document.getElementById("toggleSidebar");
  const refreshFloating = document.getElementById("refreshFloating");
  const questionList = document.getElementById("questionList");
  const logoutBtn = document.getElementById("logoutBtn");
  const examForm = document.getElementById("examForm");
  const sheetURL = "https://opensheet.elk.sh/1bzoQJDDYcRw6Tz_xJT7k8Xa5dc-tBX4pcDGfG7Gh5DM/Soal";
  const homeSheetURL = "https://opensheet.elk.sh/1bzoQJDDYcRw6Tz_xJT7k8Xa5dc-tBX4pcDGfG7Gh5DM/Home";
  const jawabanSheetURL = "https://opensheet.elk.sh/1bzoQJDDYcRw6Tz_xJT7k8Xa5dc-tBX4pcDGfG7Gh5DM/Jawaban";
  const siswaSheetURL = "https://opensheet.elk.sh/1bzoQJDDYcRw6Tz_xJT7k8Xa5dc-tBX4pcDGfG7Gh5DM/Siswa";
  let scriptURL = "";
  let timerInterval;
  let examSubmitted = false;
  let remainingTime = 120 * 60; 

  function loadQuestions() {
  fetch(sheetURL)
    .then(res => res.json())
    .then(rows => {
      examForm.innerHTML = "";
      rows.forEach((row, index) => {
        const no = index + 1; 
        const soal = row["Soal"] || "";
        const teks = row["Teks/Paragraf (Opsional)"] || "";
        const nomorTeks = row["Nomor Soal"] || "";
        const img = row["Url Gambar Soal (Opsional)"] || "";
        const vidUrl = row["Url Video Soal (Opsional)"] || "";
        const opsiA = row["Opsi A"] || "";
        const opsiB = row["Opsi B"] || "";
        const opsiC = row["Opsi C"] || "";
        const opsiD = row["Opsi D"] || "";

        let displayImg = img;
        if (img && img.includes("drive.google.com")) {
          const match = img.match(/[-\w]{25,}/);
          if (match) {
            const fileId = match[0];
            displayImg = `https://lh3.googleusercontent.com/d/${fileId}=w1920-h1080`;
          }
        }

        const imgHTML = displayImg
          ? `<img src="${displayImg}" 
                   class="img-fluid rounded my-3 shadow-sm zoomable-img"
                   alt="Gambar Soal"
                   style="width:100%; height:auto; object-fit:contain; border-radius:5px; cursor: zoom-in;">`
          : "";
        const teksHTML = teks
          ? `<div class="p-2 mb-3 border rounded bg-light" style="white-space: pre-line; line-height: 1.6; text-align:justify;">
               <b>Teks untuk soal nomor ${row["Nomor Soal"] || no}.</b><br>${teks}
             </div>`
          : "";

        const options = ["A", "B", "C", "D"]
          .map(opt => ({ key: opt, text: row["Opsi " + opt] || "" }))
          .filter(opt => opt.text.trim() !== "");

        for (let i = options.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [options[i], options[j]] = [options[j], options[i]];
        }

        const opsiHTML = options.map(opt => `
            <label class="list-group-item d-flex align-items-start">
              <input class="form-check-input me-2 mt-1" type="radio" name="q${no}" value="${opt.key}">
              <span class="option-text">${opt.text}</span>
            </label>
          `).join("");

        examForm.insertAdjacentHTML("beforeend", `
          <div class="question mb-4" id="q${no}">
            <p><strong>${no}.</strong> ${soal}</p>
            ${imgHTML}
            ${teksHTML}
            <div class="list-group">${opsiHTML}</div>
          </div>
        `);

        if (!document.getElementById("imgZoomModal")) {
          document.body.insertAdjacentHTML("beforeend", `
            <div id="imgZoomModal" 
                 style="display:none; position:fixed; z-index:9999; top:0; left:0; width:100%; height:100%;
                        justify-content:center; align-items:center; cursor: grab;">
              <img id="zoomedImage" src="" 
                   style="max-width:90%; max-height:90%; border-radius:10px; transition: transform 0.2s ease;">
            </div>
          `);

          const modal = document.getElementById("imgZoomModal");
          const zoomedImg = document.getElementById("zoomedImage");
          let scale = 1;
          let isDragging = false;
          let startX, startY, currentX = 0, currentY = 0;
          modal.addEventListener("click", (e) => {
            if (e.target === modal) {
              modal.style.display = "none";
              scale = 1;
              currentX = currentY = 0;
              zoomedImg.style.transform = `translate(0, 0) scale(1)`;
            }
          });

          zoomedImg.addEventListener("wheel", (e) => {
            e.preventDefault();
            const delta = e.deltaY * -0.0015;
            scale += delta;
            scale = Math.min(Math.max(1, scale), 4); 
            zoomedImg.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale})`;
          });

          zoomedImg.addEventListener("click", (e) => {
            e.stopPropagation();
            scale = scale === 1 ? 2 : 1;
            currentX = currentY = 0;
            zoomedImg.style.transform = `translate(0, 0) scale(${scale})`;
          });

          zoomedImg.addEventListener("mousedown", (e) => {
            if (scale <= 1) return;
            isDragging = true;
            modal.style.cursor = "grabbing";
            startX = e.clientX - currentX;
            startY = e.clientY - currentY;
          });

          modal.addEventListener("mouseup", () => {
            isDragging = false;
            modal.style.cursor = "grab";
          });

          modal.addEventListener("mousemove", (e) => {
            if (!isDragging) return;
            currentX = e.clientX - startX;
            currentY = e.clientY - startY;
            zoomedImg.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale})`;
          });

          zoomedImg.addEventListener("touchstart", (e) => {
            if (e.touches.length === 1) {
              startX = e.touches[0].clientX - currentX;
              startY = e.touches[0].clientY - currentY;
            }
          });

          zoomedImg.addEventListener("touchmove", (e) => {
            if (e.touches.length === 1 && scale > 1) {
              currentX = e.touches[0].clientX - startX;
              currentY = e.touches[0].clientY - startY;
              zoomedImg.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale})`;
            }
          });

          let initialDistance = 0;
          zoomedImg.addEventListener("touchmove", (e) => {
            if (e.touches.length === 2) {
              const dx = e.touches[0].clientX - e.touches[1].clientX;
              const dy = e.touches[0].clientY - e.touches[1].clientY;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (!initialDistance) initialDistance = distance;
              const zoomChange = distance / initialDistance;
              scale = Math.min(Math.max(1, scale * zoomChange), 4);
              zoomedImg.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale})`;
              initialDistance = distance;
            }
          });

          zoomedImg.addEventListener("touchend", () => {
            initialDistance = 0;
          });
        }

        document.querySelectorAll(".zoomable-img").forEach(img => {
          img.addEventListener("click", () => {
            const modal = document.getElementById("imgZoomModal");
            const zoomedImg = document.getElementById("zoomedImage");
            zoomedImg.src = img.src;
            modal.style.display = "flex";
            scale = 1;
            currentX = currentY = 0;
            zoomedImg.style.transform = `translate(0, 0) scale(1)`;
          });
        });
      });

      examForm.insertAdjacentHTML(
        "beforeend",
        `
        <div id="warningMessage" style="display:none;text-align:center;color:#dc3545;font-weight:600;margin-bottom:10px;">
          ⚠️ Tinjau kembali jawaban Anda!
        </div>
        <button type="submit" class="btn btn-success w-100 mt-3 btn-submit">
          <i class="fa-solid fa-paper-plane me-1"></i> Kumpulkan Jawaban
        </button>`
      );
      const style = document.createElement("style");
      style.textContent = `
        .video-wrapper {
          position: relative;
          width: 100%;
          padding-bottom: 56.25%;
          height: 0;
          overflow: hidden;
          border-radius: 8px;
          margin-top: 10px;
          margin-bottom: 10px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        .video-wrapper iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 0;
        }

        .list-group-item {
          display: flex;
          align-items: flex-start;
          text-align: left;
          white-space: normal !important;
          word-wrap: break-word;
        }

        .list-group-item .option-text {
          flex: 1;
          text-align: left;
          line-height: 1.5;
          margin-top: -2px;
        }

        .form-check-input {
          margin-top: 4px;
        }
      `;
      document.head.appendChild(style);
      generateSidebar();
      attachRadioEvents();
      restoreAnswers();
    })
    .catch(() => {
      examForm.innerHTML = `
        <div class="alert alert-danger text-center">
          Gagal memuat soal. Periksa koneksi atau URL sheet Anda.
        </div>`;
    });
 }


  function extractYouTubeID(url) {
    const regExp = /^.*(?:youtu\.be\/|shorts\/|v\/|u\/\w\/|embed\/|watch\?v=|watch\?.+&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[1].length === 11) ? match[1] : null;
  }

  function attachRadioEvents() {
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
      radio.addEventListener('change', () => {
        const answers = JSON.parse(localStorage.getItem("answers")) || {};
        answers[radio.name] = radio.value;
        localStorage.setItem("answers", JSON.stringify(answers));
        updateSidebarColor(radio.name);
      });
    });
  }

  function updateSidebarColor(qName) {
    const qIndex = parseInt(qName.replace('q', '')) - 1;
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    if (sidebarItems[qIndex]) sidebarItems[qIndex].classList.add('answered');
  }

  function restoreAnswers() {
    const savedAnswers = JSON.parse(localStorage.getItem("answers"));
    if (!savedAnswers) return;
    for (let q in savedAnswers) {
      const radio = document.querySelector(`input[name="${q}"][value="${savedAnswers[q]}"]`);
      if (radio) {
        radio.checked = true;
        updateSidebarColor(q);
      }
    }
  }

  function generateSidebar() {
    const questions = document.querySelectorAll(".question");
    questionList.innerHTML = "";
    questions.forEach((q, index) => {
      const btn = document.createElement("div");
      btn.className = "sidebar-item";
      btn.textContent = index + 1;
      btn.onclick = () => {
        sidebar.classList.remove("active");
        q.scrollIntoView({ behavior: "smooth", block: "center" });
      };
      questionList.appendChild(btn);
    });
  }

  function refreshQuestions() {
    Swal.fire({
      title: "Reload soal?",
      text: "Gunakan fitur ini jika ada soal, gambar, atau video yang belum tampil.",
      showCancelButton: true,
      confirmButtonText: "Ya, Muat Ulang",
      cancelButtonText: "Batal",
      confirmButtonColor: "#17a2b8"
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Memuat ulang...",
          html: "Sedang mengambil data soal ...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });

        setTimeout(() => {
          loadQuestions();
          Swal.fire({
            icon: "success",
            title: "Soal diperbarui!",
            text: "Semua soal dan media telah dimuat ulang.",
            timer: 2000,
            showConfirmButton: false
          });
        }, 1000);
      }
    });
  }

  refreshFloating.addEventListener("click", refreshQuestions);
  if (document.getElementById("refreshBtn")) {
    document.getElementById("refreshBtn").addEventListener("click", refreshQuestions);
  }

  function startTimer(duration) {
    clearInterval(timerInterval);
    let remaining = duration;
    updateTimerDisplay(remaining);
    timerInterval = setInterval(() => {
      if (examSubmitted) return;
      remaining--;
      localStorage.setItem("remainingTime", remaining);
      updateTimerDisplay(remaining);
      if (remaining <= 0) {
        clearInterval(timerInterval);
        timerDisplay.innerHTML = "⏰ Waktu Habis!";
        Swal.fire({
          title: "Waktu Habis!",
          text: "Ujian telah berakhir.",
          icon: "warning",
          confirmButtonText: "OK"
        }).then(() => {
          localStorage.clear();
          location.reload();
        });
      }
    }, 1000);
  }

  function updateTimerDisplay(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    timerDisplay.innerHTML = `Sisa Waktu: <strong>${m}:${s < 10 ? "0" + s : s}</strong>`;
  }

 
  let siswaData = [];
  let globalPassword = "";
  fetch(siswaSheetURL)
    .then(res => res.json())
    .then(rows => {
      const passwordRow = rows.find(r => r["Password Ujian"] && r["Password Ujian"].trim() !== "");
      if (passwordRow) {
        globalPassword = passwordRow["Password Ujian"].trim();
        console.log("Password global ditemukan:", globalPassword);
      } else {
        console.error("Password global tidak ditemukan!");
      }
      siswaData = rows.filter(r => r["Nama Siswa"] && r["Nama Siswa"].trim() !== "");
      const dataList = document.getElementById("studentList");
      siswaData.forEach(r => {
        const option = document.createElement("option");
        option.value = r["Nama Siswa"];
        dataList.appendChild(option);
      });
     })
  .catch(() => Swal.fire("⚠️ Gagal memuat data siswa!"));


  studentName.addEventListener("input", function() {
    const inputName = this.value.trim().toLowerCase();
    if (inputName.length >= 4) {
      const match = siswaData.find(s => s["Nama Siswa"].toLowerCase() === inputName);
      if (match) {
        studentClass.innerHTML = `<option value="${match["Kelas"]}" selected>${match["Kelas"]}</option>`;
      }
    }
  });

 
  async function cekApakahSudahMengerjakan(nama, kelas) {
    try {
      const res = await fetch(jawabanSheetURL);
      const rows = await res.json();
      const sudah = rows.find(r =>
        r["Nama Siswa"] &&
        r["Kelas"] &&
        r["Nama Siswa"].toLowerCase() === nama.toLowerCase() &&
        r["Kelas"].toLowerCase() === kelas.toLowerCase()
      );
      return !!sudah;
    } catch (err) {
      console.error("Gagal cek sheet Jawaban:", err);
      return false;
    }
  }

  loginForm.addEventListener("submit", async function(e) {
  e.preventDefault();
  const name = studentName.value.trim();
  const kelas = studentClass.value;
  const pass = studentPass.value.trim();
  function smallAlert(icon, message) {
    Swal.fire({
      icon: icon,
      html: `<small>${message}</small>`, 
      toast: true,    
      position: 'top',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      customClass: {
        popup: 'small-swal'
      }
    });
  }

  if (!name || !kelas || !pass) {
    smallAlert("warning", "⚠️ Semua field wajib diisi!");
    return;
  }

  const found = siswaData.find(s => s["Nama Siswa"].toLowerCase() === name.toLowerCase());
  if (!found) {
    smallAlert("error", "Nama tidak ditemukan di data siswa!");
    return;
  }

  const sudahMengerjakan = await cekApakahSudahMengerjakan(name, kelas);
  if (sudahMengerjakan) {
    smallAlert("warning", "⚠️ Anda sudah mengerjakan tes!");
    return;
  }
  if (pass === globalPassword) {
    localStorage.setItem("examSession", JSON.stringify({
      loggedIn: true,
      name: name,
      kelas: kelas,
      startTime: Date.now()
    }));
      localStorage.setItem("remainingTime", remainingTime);
      loginForm.style.display = "none";
      examSection.style.display = "block";
      examContainer.classList.add("expanded");
      welcomeText.textContent = `Welcome, ${name} - ${kelas}`;
      loadQuestions();
      toggleSidebar.style.display = "block";
      refreshFloating.style.display = "block";
      openFullscreen();
      startTimer(remainingTime);
    } else {
      smallAlert("error", "⚠️ Password salah!");
    }
  });

  fetch(homeSheetURL)
  .then(res => res.json())
  .then(rows => {
    const urlValue = rows[1]["Title"]; 
    if (urlValue && urlValue.startsWith("https://script.google.com")) {
      scriptURL = urlValue.trim();
      console.log("✅ URL script ditemukan:", scriptURL);
    } else {
      Swal.fire({
        icon: "error",
        title: "URL Tidak Ditemukan!",
        text: "Pastikan URL tersedia.",
        confirmButtonText: "OK"
      });
    }
  });


  examForm.addEventListener("submit", function(e) {
  e.preventDefault();
    const radios = document.querySelectorAll('input[type="radio"]');
    const total = new Set(Array.from(radios).map(r => r.name)).size;
    const answered = new Set(Array.from(radios).filter(r => r.checked).map(r => r.name)).size;
    const warningMessage = document.getElementById("warningMessage");

    if (answered < total) {
      warningMessage.style.display = "block";
      setTimeout(() => warningMessage.style.display = "none", 3000);
      return;
    }

    Swal.fire({
      title: "Kumpulkan Jawaban?",
      text: "Pastikan semua jawaban sudah diisi dengan benar.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Kumpulkan",
      cancelButtonText: "Batal",
      confirmButtonColor: "#28a745"
    }).then((result) => {
      if (result.isConfirmed) {
        if (!scriptURL) {
          Swal.fire({
            icon: "error",
            title: "URL Belum Siap!",
            text: "Tidak dapat mengirim jawaban karena URL belum berhasil dimuat.",
            confirmButtonText: "OK"
          });
          return;
        }

        examSubmitted = true;
        clearInterval(timerInterval);

        const answers = JSON.parse(localStorage.getItem("answers")) || {};
        const examSession = JSON.parse(localStorage.getItem("examSession")) || {};
        const payload = {
          name: examSession.name,
          class: examSession.kelas,
          answers: JSON.stringify(answers),
          startTime: examSession.startTime,
          endTime: Date.now(),
          duration: ((Date.now() - examSession.startTime) / 1000).toFixed(0)
        };

        Swal.fire({
          title: "Mengirim Jawaban...",
          html: "Mohon tunggu sebentar...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });

        fetch(scriptURL, {
          method: "POST",
          body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(data => {
          if (data.result === "success") {
            Swal.fire({
              icon: "success",
              title: "Jawaban Terkirim!",
              html: `
                <b>${data.nama}</b> - ${data.kelas}<br>
                <hr>
                <b>Skor Anda:</b> ${data.score} / 100
              `,
              confirmButtonText: "Tutup"
            }).then(() => {
              localStorage.clear();
              location.reload();
            });
          } else {
            Swal.fire("Gagal mengirim!", "Terjadi kesalahan pada server.", "error");
          }
        })
        .catch(err => {
          console.error("Error:", err);
          Swal.fire("Gagal mengirim jawaban!", "Periksa koneksi internet Anda.", "error");
        });
      }
    });
  });


  function openFullscreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen();
  }

  window.addEventListener("load", () => {
    const savedLogin = JSON.parse(localStorage.getItem("examSession"));
    const savedTime = localStorage.getItem("remainingTime");
    if (savedLogin && savedLogin.loggedIn) {
      loginForm.style.display = "none";
      examSection.style.display = "block";
      examContainer.classList.add("expanded");
      toggleSidebar.style.display = "block";
      refreshFloating.style.display = "block";
      welcomeText.textContent = `Welcome, ${savedLogin.name} - ${savedLogin.kelas}`;
      loadQuestions();
      remainingTime = savedTime ? parseInt(savedTime) : 120 * 60;
      startTimer(remainingTime);
    }
  });

  toggleSidebar.addEventListener("click", () => {
    sidebar.classList.toggle("active");
  });

  logoutBtn.addEventListener("click", () => {
  sidebar.classList.remove("active");
  Swal.fire({
    title: "Yakin ingin logout?",
    text: "Semua data ujian tidak akan tersimpan",
    showCancelButton: true,
    confirmButtonText: "Ya, Logout",
    cancelButtonText: "Batal",
    confirmButtonColor: "#dc3545"
  }).then(result => {
    if (result.isConfirmed) {
      clearInterval(timerInterval);
      localStorage.clear();
      location.reload();
    }
  });
});

document.addEventListener("contextmenu", (e) => e.preventDefault());
document.addEventListener("selectstart", (e) => e.preventDefault());
document.addEventListener("dragstart", (e) => e.preventDefault());
["copy", "cut", "paste"].forEach(evt => {
  document.addEventListener(evt, (e) => e.preventDefault());
});
document.addEventListener("keydown", function(e) {
  if (
    (e.ctrlKey && ["c", "u", "x", "v", "a", "s", "p"].includes(e.key.toLowerCase())) ||
    e.key === "F12" ||
    (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase()))
  ) {
    e.preventDefault();
  }

});
