// Password visibility toggle function
function togglePassword(inputId) {
    const passwordInput = document.getElementById(inputId);
    const toggleButton = passwordInput.nextElementSibling;
    const showText = toggleButton.querySelector('.show-text');
    const hideText = toggleButton.querySelector('.hide-text');
    
    if (passwordInput.type === 'password') {
        // Show password
        passwordInput.type = 'text';
        showText.style.display = 'none';
        hideText.style.display = 'inline';
    } else {
        // Hide password
        passwordInput.type = 'password';
        showText.style.display = 'inline';
        hideText.style.display = 'none';
    }
}