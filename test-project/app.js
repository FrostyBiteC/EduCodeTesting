document.getElementById('clickBtn').addEventListener('click', function() {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = 'Hello from WebContainer!';
    messageDiv.className = 'success';
    messageDiv.style.display = 'block';
    
    // Add some animation
    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
        messageDiv.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateY(0)';
    }, 10);
});

console.log('WebContainer test app loaded successfully');