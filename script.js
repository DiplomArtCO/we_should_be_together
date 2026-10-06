(() => {
  "use strict";

  const audio = document.querySelector("#background-audio");
  const audioToggle = document.querySelector("#audio-toggle");
  const audioToggleLabel = document.querySelector("#audio-toggle-label");
  const audioMute = document.querySelector("#audio-mute");
  const audioStatus = document.querySelector("#audio-status");
  const bearTrigger = document.querySelector("#bear-trigger");
  const proposalDialog = document.querySelector("#proposal-dialog");
  const proposalClose = document.querySelector("#proposal-close");
  const conversationAction = document.querySelector("#conversation-action");

  if (conversationAction) {
    const conversationLink = conversationAction.dataset.conversationLink?.trim();
    const isAllowedLink = /^(https?:|mailto:|tel:)/i.test(conversationLink ?? "");

    if (conversationLink && isAllowedLink) {
      const link = document.createElement("a");
      link.href = conversationLink;
      link.textContent = "Si quieres hablar, escríbeme";
      if (/^https?:/i.test(conversationLink)) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
      conversationAction.append(link);
    }
  }

  const setAudioStatus = (message, state = "ready") => {
    if (!audioStatus) return;
    audioStatus.textContent = message;
    audioStatus.dataset.state = state;
  };

  const updateAudioControls = () => {
    if (!audio || !audioToggle || !audioToggleLabel) return;

    const isPlaying = !audio.paused && !audio.ended;
    audioToggle.setAttribute("aria-pressed", String(isPlaying));
    audioToggleLabel.textContent = isPlaying ? "Pausar música" : "Reproducir música";

    if (audioMute) {
      const isMuted = audio.muted;
      audioMute.setAttribute("aria-pressed", String(isMuted));
      audioMute.textContent = isMuted ? "Activar sonido" : "Silenciar";
    }
  };

  const requestBackgroundPlayback = () => {
    if (!audio) return;

    audio.volume = 0.5;
    const playback = audio.play();
    if (playback && typeof playback.catch === "function") {
      playback
        .then(() => {
          setAudioStatus("Autofotos · Melendi");
          updateAudioControls();
        })
        .catch(() => {
          setAudioStatus("Pulsa reproducir para escuchar Autofotos · Melendi", "blocked");
          updateAudioControls();
        });
    }
  };

  if (audio && audioToggle) {
    audio.addEventListener("play", () => {
      setAudioStatus("Autofotos · Melendi");
      updateAudioControls();
    });

    audio.addEventListener("pause", updateAudioControls);
    audio.addEventListener("volumechange", updateAudioControls);
    audio.addEventListener("error", () => {
      setAudioStatus(
        "No se encontró Autofotos · Melendi; la carta sigue disponible sin música",
        "error",
      );
      updateAudioControls();
    });

    audioToggle.addEventListener("click", () => {
      if (audio.paused) {
        audio
          .play()
          .then(() => setAudioStatus("Autofotos · Melendi"))
          .catch(() => {
            setAudioStatus("El navegador bloqueó la reproducción. Inténtalo de nuevo.", "blocked");
          })
          .finally(updateAudioControls);
      } else {
        audio.pause();
      }
    });

    if (audioMute) {
      audioMute.addEventListener("click", () => {
        audio.muted = !audio.muted;
        setAudioStatus(audio.muted ? "Música silenciada" : "Autofotos · Melendi");
        updateAudioControls();
      });
    }

    requestBackgroundPlayback();
  }

  const closeProposal = () => {
    if (!proposalDialog) return;
    if (typeof proposalDialog.close === "function" && proposalDialog.open) {
      proposalDialog.close();
    } else {
      proposalDialog.removeAttribute("open");
    }
    bearTrigger?.focus();
  };

  if (bearTrigger && proposalDialog) {
    bearTrigger.addEventListener("click", () => {
      if (typeof proposalDialog.showModal === "function") {
        proposalDialog.showModal();
      } else {
        proposalDialog.setAttribute("open", "");
      }
      proposalClose?.focus();
    });

    proposalClose?.addEventListener("click", closeProposal);
    proposalDialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeProposal();
    });
    proposalDialog.addEventListener("close", () => bearTrigger.focus());
  }

  document.querySelectorAll("img").forEach((image) => {
    image.addEventListener("error", () => {
      const wrapper = image.closest(".memory-card__image-wrap, .floating-detail");
      if (!wrapper || wrapper.dataset.failed === "true") return;

      wrapper.dataset.failed = "true";
      if (wrapper.classList.contains("floating-detail")) {
        wrapper.classList.add("is-missing");
        return;
      }
      wrapper.innerHTML = '<p class="memory-card__fallback">Este recuerdo aparecerá aquí cuando el archivo esté disponible.</p>';
    });
  });
})();
