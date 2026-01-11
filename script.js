document.addEventListener('DOMContentLoaded', () => {
   
    const API_URLS = {
        // Меняем на JSONPlaceholder (он надежнее)
        gallery: 'https://jsonplaceholder.typicode.com/users', 
        // Для отправки формы тоже поменяем на надежный эхо-сервер
        temperature: 'https://jsonplaceholder.typicode.com/posts' 
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
        galleryGrid.innerHTML = '';
        emptyMessage.hidden = true;
        loader.hidden = false;
        
        try {
            // Запрос данных
            const data = await fetchWithRetry(API_URLS.gallery, {}, 3, 1000);
            
            // JSONPlaceholder возвращает сразу массив, без поля .data
            // Берем только первые 4 элемента (как в задании)
            const images = data.slice(0, 4); 

            if (images.length === 0) {
                emptyMessage.hidden = false;
            } else {
                renderImages(images);
            }
        } catch (error) {
            console.error('Ошибка загрузки:', error); // Важно для отладки
            showToast('Не удалось загрузить изображения. Проверьте соединение.', 'error');
        } finally {
            loader.hidden = true;
        }
    }

    function renderImages(images) {
        images.forEach(item => {
            const card = document.createElement('div');
            card.className = 'gallery-item';
            
            // Генерируем аватарки через роботов, так как в этом API нет картинок
            const avatarUrl = `https://robohash.org/${item.id}?set=set4&size=150x150`;

            card.innerHTML = `
                <img src="${avatarUrl}" alt="${item.name}">
                <div class="gallery-caption">
                    <strong>${item.name}</strong><br>
                    <span>${item.email}</span>
                </div>
            `;
            galleryGrid.appendChild(card);
        });
    }

    function renderImages(images) {
        images.forEach(item => {
            const card = document.createElement('div');
            card.className = 'gallery-item';
            
            // Генерируем ссылку на картинку-робота (так как в этом API нет своих картинок)
            // Используем ID пользователя, чтобы у каждого был свой уникальный робот
            const avatarUrl = `https://robohash.org/${item.id}?set=set4&size=150x150`;

            // Используем поля name и email, которые есть в новом API
            card.innerHTML = `
                <img src="${avatarUrl}" alt="${item.name}">
                <div class="gallery-caption">
                    <strong>${item.name}</strong><br>
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