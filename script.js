document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Contagem Regressiva ---
    const countDownDate = new Date("Jun 27, 2026 19:30:00").getTime();

    const x = setInterval(function () {
        const now = new Date().getTime();
        const distance = countDownDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById("days").innerHTML = days < 10 ? "0" + days : days;
        document.getElementById("hours").innerHTML = hours < 10 ? "0" + hours : hours;
        document.getElementById("minutes").innerHTML = minutes < 10 ? "0" + minutes : minutes;
        document.getElementById("seconds").innerHTML = seconds < 10 ? "0" + seconds : seconds;

        if (distance < 0) {
            clearInterval(x);
            document.getElementById("days").innerHTML = "00";
            document.getElementById("hours").innerHTML = "00";
            document.getElementById("minutes").innerHTML = "00";
            document.getElementById("seconds").innerHTML = "00";
            // Opcional: Mensagem de evento iniciado
        }
    }, 1000);


    // --- 2. Copiar Chave PIX ---
    const copyBtn = document.getElementById('copy-btn');
    const pixKey = document.getElementById('pix-key').innerText;
    const copyFeedback = document.getElementById('copy-feedback');

    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(pixKey).then(() => {
            copyFeedback.classList.add('show');
            setTimeout(() => {
                copyFeedback.classList.remove('show');
            }, 3000);
        }).catch(err => {
            console.error('Erro ao copiar: ', err);
            alert("Não foi possível copiar a chave automaticamente. Por favor, selecione e copie.");
        });
    });

    // --- 2.5 Máscara de WhatsApp ---
    const whatsappInput = document.getElementById('whatsapp');
    whatsappInput.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito
        if (value.length > 11) value = value.slice(0, 11); // Limita a 11 dígitos (DDD + 9 dígitos)

        // Aplica a máscara: (XX) XXXXX-XXXX
        if (value.length > 2) {
            value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        }
        if (value.length > 10) {
            value = `${value.slice(0, 10)}-${value.slice(10)}`;
        }

        e.target.value = value;
    });


    // --- 3. Formulário RSVP ---
    const rsvpForm = document.getElementById('rsvp-form');
    const formSuccess = document.getElementById('form-success');
    const wantsNotification = document.getElementById('wants-notification');
    const frequencyGroup = document.getElementById('notification-frequency-group');

    // Mostra/esconde opções de frequência baseado no checkbox
    wantsNotification.addEventListener('change', (e) => {
        if (e.target.checked) {
            frequencyGroup.classList.remove('hidden');
        } else {
            frequencyGroup.classList.add('hidden');
        }
    });

    rsvpForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Impede o recarregamento

        const name = document.getElementById('name').value;
        const whatsappNumber = document.getElementById('whatsapp').value;
        const attendance = document.querySelector('input[name="attendance"]:checked').value;
        const adults = document.getElementById('adults').value;
        const kids = document.getElementById('kids').value;
        const message = document.getElementById('message').value;
        const receiveNotification = wantsNotification.checked ? 'Sim' : 'Não';
        const frequency = wantsNotification.checked ? document.getElementById('notification-frequency').value + ' dias' : 'N/A';

        // Mudando o texto do botão para indicar carregamento
        const submitBtn = rsvpForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerText;
        submitBtn.innerText = "Enviando...";
        submitBtn.disabled = true;

        // Validação de WhatsApp (deve ter 10 ou 11 dígitos - considerando números antigos sem o 9)
        const unmaskedPhone = whatsappNumber.replace(/\D/g, '');
        if (unmaskedPhone.length < 10) {
            alert("Por favor, insira um número de WhatsApp válido com o DDD.");
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
            return;
        }

        // URL do Google Apps Script (Você vai colar o link gerado aqui)
        const scriptURL = "https://script.google.com/macros/s/AKfycbzyewW01dStGG_dP4T88da8IHKSS0UOvkVn1m_bi2by6qHsjRjhA8vA3zByFlTI9p8CNw/exec";

        // Caso a URL ainda não tenha sido configurada
        if (scriptURL === "https://script.google.com/macros/s/AKfycbzyewW01dStGG_dP4T88da8IHKSS0UOvkVn1m_bi2by6qHsjRjhA8vA3zByFlTI9p8CNw/exec") {
            alert("Aviso: A integração com o Google Sheets ainda precisa ser configurada. Siga o passo a passo que o assistente te enviou!");
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
            return;
        }

        fetch(scriptURL, {
            method: "POST",
            body: JSON.stringify({
                Nome: name,
                WhatsApp: whatsappNumber,
                Comparecera: attendance === 'sim' ? 'Sim' : 'Não',
                Adultos: attendance === 'sim' ? adults : '0',
                Criancas: attendance === 'sim' ? kids : '0',
                ReceberNotificacoes: receiveNotification,
                FrequenciaNotificacoes: frequency,
                Observacoes: message || 'Nenhuma'
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.result === 'success') {
                    // Mostra mensagem de sucesso na tela e esconde o form
                    rsvpForm.classList.add('hidden');
                    formSuccess.classList.remove('hidden');
                } else {
                    throw new Error(data.error);
                }
            })
            .catch(error => {
                console.error('Erro ao enviar:', error);
                alert("Houve um erro ao enviar sua confirmação. Por favor, tente novamente.");
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            });
    });


    // --- 4. Animações de Scroll (Fade In) ---
    const fadeElements = document.querySelectorAll('.fade-in');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Anima apenas uma vez
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => observer.observe(el));
});
