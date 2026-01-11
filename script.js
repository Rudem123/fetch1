document.addEventListener('DOMContentLoaded', () => {
    // === КОНФИГУРАЦИЯ API ===
    // Используем тестовые API. 
    // Замени URL ниже на те, что даны в твоем задании, когда сервер будет доступен.
    const API_URLS = {
        // reqres.in возвращает список пользователей с картинками (эмулируем галерею)
        gallery: 'https://reqres.in/api/users?per_page=4', 
        // httpbin.org просто возвращает то, что мы ему отправили (эхо-сервер)
        temperature: 'https://httpbin.org/post' 
    };

    // Элементы DOM
    const galleryGrid = document.getElementById('galleryGrid');
    const loader = document.getElementById('loader');
    const refreshBtn = document.getElementById('refreshBtn');
    const emptyMessage = document.getElementById('emptyMessage');
    
    const tempForm = document.getElementById('tempForm');
    const submitTempBtn = document.getElementById('submitTempBtn');
    const toastContainer = document.getElementById('toastContainer');

    // ============================================
    // 1. Компонент Toast (Уведомления)
    // ============================================
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const textSpan = document.createElement('span');
        textSpan.textContent = message;
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'toast-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => removeToast(toast);

        toast.append(textSpan, closeBtn);
        toastContainer.appendChild(toast);

        // Анимация появления (небольшая задержка, чтобы CSS transition сработал)
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Автоматическое закрытие через 5 секунд
        setTimeout(() => removeToast(toast), 5000);
    }

    function removeToast(toast) {
        toast.classList.remove('show');
        // Ждем окончания анимации перед удалением из DOM
        toast.addEventListener('transitionend', () => {
            toast.remove();
        });
    }

    // ============================================
    // 2. Утилита для запросов с повторными попытками
    // ============================================
    async function fetchWithRetry(url, options = {}, retries = 3, delay = 1000) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            if (retries > 0) {
                console.warn(`Запрос не удался, повторная попытка через ${delay}мс... Осталось попыток: ${retries}`);
                // Ждем delay миллисекунд
                await new Promise(resolve => setTimeout(resolve, delay));
                // Рекурсивный вызов
                return fetchWithRetry(url, options, retries - 1, delay);
            } else {
                // Если попытки кончились, пробрасываем ошибку дальше
                throw error;
            }
        }
    }

    // ============================================
    // 3. Логика Галереи
    // ============================================
    async function loadGallery() {
        // Сброс состояния
        galleryGrid.innerHTML = '';
        emptyMessage.hidden = true;
        loader.hidden = false;
        
        try {
            // Выполняем запрос с retry (3 попытки)
            const data = await fetchWithRetry(API_URLS.gallery, {}, 3, 1000);
            
            // reqres.in возвращает массив в поле .data. 
            // Если у твоего сервера массив сразу в корне, используй: const images = data;
            const images = data.data || []; 

            if (images.length === 0) {
                emptyMessage.hidden = false;
            } else {
                renderImages(images);
            }
        } catch (error) {
            console.error(error);
            showToast('Не удалось загрузить изображения. Проверьте соединение.', 'error');
        } finally {
            loader.hidden = true;
        }
    }

    function renderImages(images) {
        images.forEach(item => {
            // Создаем карточку
            const card = document.createElement('div');
            card.className = 'gallery-item';
            
            // В reqres поля: avatar (url), first_name (имя)
            // Подстрой эти поля под реальный ответ твоего сервера (например: item.url, item.title)
            card.innerHTML = `
                <img src="${item.avatar}" alt="${item.first_name}">
                <div class="gallery-caption">
                    <strong>${item.first_name} ${item.last_name}</strong><br>
                    <span>ID: ${item.id}</span>
                </div>
            `;
            galleryGrid.appendChild(card);
        });
    }

    // Загрузка при открытии страницы
    loadGallery();

    // Кнопка обновления
    refreshBtn.addEventListener('click', loadGallery);


    // ============================================
    // 4. Логика отправки температуры
    // ============================================
    tempForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Остановить стандартную отправку

        // Блокируем форму
        const formElements = tempForm.querySelectorAll('input, button');
        formElements.forEach(el => el.disabled = true);

        // Сбор данных
        const formData = {
            room_id: document.getElementById('roomId').value,
            // Преобразуем температуру в число (требование задания)
            temperature: Number(document.getElementById('tempValue').value)
        };

        try {
            const responseData = await fetch(API_URLS.temperature, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                body: JSON.stringify(formData)
            });

            if (!responseData.ok) throw new Error('Ошибка сервера');
            
            const result = await responseData.json();
            
            // Успех
            showToast(`Данные приняты! Сервер ответил: ${JSON.stringify(result.json || result)}`, 'success');
            tempForm.reset(); // Очистить форму

        } catch (error) {
            // Ошибка
            console.error(error);
            showToast('Ошибка отправки данных. Попробуйте позже.', 'error');
            // Форму НЕ очищаем (требование задания)
        } finally {
            // Разблокируем форму
            formElements.forEach(el => el.disabled = false);
        }
    });
});