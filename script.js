document.addEventListener('DOMContentLoaded', () => {
    // Получаем элементы DOM
    const openBtn = document.getElementById('openDialogBtn');
    const dialog = document.getElementById('registerDialog');
    const closeBtn = document.getElementById('closeDialogBtn'); // Кнопка "Закрыть" внизу
    const closeCross = document.getElementById('closeDialogCross'); // Крестик
    const form = document.getElementById('registerForm');
    const passwordInput = document.getElementById('passwordInput');
    const showPasswordBtn = document.getElementById('showPasswordBtn');
    
    // Выбираем все поля ввода внутри формы
    const inputs = form.querySelectorAll('input');
  
    // ============================================
    // 1. Управление модальным окном
    // ============================================
  
    // Открытие окна
    openBtn.addEventListener('click', () => {
        dialog.showModal(); // showModal() делает окно модальным (с затемнением фона)
    });
  
    // Функция закрытия
    const closeDialog = () => {
        dialog.close();
        form.reset(); // Очищаем форму при закрытии (опционально)
        // Скрываем все ошибки
        inputs.forEach(input => {
            const errorSpan = document.getElementById(input.getAttribute('aria-describedby'));
            if (errorSpan) errorSpan.hidden = true;
            input.setAttribute('aria-invalid', 'false');
        });
    };
  
    // Закрытие по кнопкам
    closeBtn.addEventListener('click', closeDialog);
    closeCross.addEventListener('click', closeDialog);
  
    // Закрытие при клике по затемненному фону (backdrop)
    dialog.addEventListener('click', (event) => {
        // Если кликнули именно по элементу dialog (а не по его содержимому)
        if (event.target === dialog) {
            closeDialog();
        }
    });
  
    // ============================================
    // 2. Управление видимостью пароля
    // ============================================
    
    // Нажали кнопку мыши / коснулись пальцем
    showPasswordBtn.addEventListener('pointerdown', () => {
        passwordInput.type = 'text';
    });
  
    // Отпустили кнопку мыши / убрали палец
    showPasswordBtn.addEventListener('pointerup', () => {
        passwordInput.type = 'password';
    });
    
    // Если увели курсор с кнопки, тоже скрываем (защита от бага)
    showPasswordBtn.addEventListener('pointerleave', () => {
        passwordInput.type = 'password';
    });
  
    // ============================================
    // 3. Валидация данных
    // ============================================
  
    // Функция для проверки одного поля
    function validateField(input) {
        // Находим связанный span для ошибки
        const errorSpanId = input.getAttribute('aria-describedby');
        const errorSpan = document.getElementById(errorSpanId);
  
        // Constraint Validation API: свойство validity
        if (!input.validity.valid) {
            // Поле НЕ валидно
            input.setAttribute('aria-invalid', 'true');
            errorSpan.hidden = false;
            
            // Определяем текст ошибки
            if (input.validity.valueMissing) {
                errorSpan.textContent = 'Поле обязательно для заполнения.';
            } else if (input.validity.tooShort) {
                errorSpan.textContent = `Слишком коротко. Минимум символов: ${input.minLength}.`;
            } else if (input.validity.typeMismatch) {
                errorSpan.textContent = 'Неверный формат данных (например, нужен email).';
            } else {
                // Стандартное браузерное сообщение
                errorSpan.textContent = input.validationMessage; 
            }
        } else {
            // Поле валидно
            input.setAttribute('aria-invalid', 'false');
            errorSpan.textContent = '';
            errorSpan.hidden = true;
        }
    }
  
    // Навешиваем обработчики на все поля
    inputs.forEach(input => {
        // 1. При потере фокуса (blur) - проверяем
        input.addEventListener('blur', () => {
            validateField(input);
        });
        
        // 2. При вводе данных (input) - если поле было красным, проверяем, исправил ли юзер
        input.addEventListener('input', () => {
            if (input.getAttribute('aria-invalid') === 'true') {
                validateField(input);
            }
        });
    });
  
    // ============================================
    // 4. Отправка формы (Submit)
    // ============================================
    form.addEventListener('submit', (event) => {
        // Отменяем стандартную перезагрузку страницы
        event.preventDefault();
  
        let isFormValid = true;
        let firstInvalidInput = null;
  
        // Проходим по всем полям еще раз
        inputs.forEach(input => {
            if (!input.checkValidity()) {
                isFormValid = false;
                validateField(input); // Показываем ошибку
                if (!firstInvalidInput) {
                    firstInvalidInput = input;
                }
            }
        });
  
        if (isFormValid) {
            // Если все ок - собираем данные
            const formData = new FormData(form);
            
            console.group('Данные формы для отправки:');
            for (let [name, value] of formData.entries()) {
                console.log(`${name}: ${value}`);
            }
            console.groupEnd();
            
            alert('Форма успешно валидирована! Данные в консоли.');
            closeDialog(); // Закрываем окно
        } else {
            // Если есть ошибки - фокус на первое ошибочное поле
            if (firstInvalidInput) {
                firstInvalidInput.focus();
            }
        }
    });
});