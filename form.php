<?php
if (isset($_POST['submit'])) {
    $name = htmlspecialchars($_POST['name']);
    $email = htmlspecialchars($_POST['email']);
    $number = htmlspecialchars($_POST['number']);
    $subject = htmlspecialchars($_POST['subject']);
    $message = htmlspecialchars($_POST['message']);

    $to = "itsvickysperah@gmail.com"; // Replace with your recipient email
    $headers = "From: " . $name . " <" . $email . ">\r\n";
    $headers .= "Reply-To: " . $email . "\r\n";
    $email_body = "Name: " . $name . "\n" .
                  "Email: " . $email . "\n" .
                  "Number: " . $number . "\n" .
                  "Subject: " . $subject . "\n" .
                  "Message: " . $message;

    if (mail($to, $subject, $email_body, $headers)) {
        echo "Thank you for your reaching out! We would get back to you as soon as possible";
    } else {
        echo "Error sending message. Please try again later.";
    }
} else {
    echo "Form submission error.";
}
?>