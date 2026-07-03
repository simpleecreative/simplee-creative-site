<?php
/**
 * Simplee Creative — contact form handler (Hostinger/Apache + PHP).
 * Accepts POST from the contact form, emails the submission, returns JSON.
 */

header('Content-Type: application/json');

const RECIPIENT = 'dylanlspies@gmail.com';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

// Honeypot: hidden field real users never fill. Bots do. Pretend success.
if (!empty($_POST['website'] ?? '')) {
    echo json_encode(['ok' => true]);
    exit;
}

$clean = static function (string $v): string {
    return trim(str_replace(["\r", "\n"], ' ', $v));
};

$name     = $clean($_POST['name'] ?? '');
$email    = $clean($_POST['email'] ?? '');
$business = $clean($_POST['business'] ?? '');
$need     = $clean($_POST['need'] ?? '');
$message  = trim($_POST['message'] ?? '');

if ($name === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Missing or invalid fields']);
    exit;
}

if (strlen($message) > 5000) {
    $message = substr($message, 0, 5000);
}

$host    = preg_replace('/[^a-z0-9.\-]/i', '', $_SERVER['HTTP_HOST'] ?? 'simpleecreative.com');
$host    = preg_replace('/^www\./', '', $host);
$subject = 'New project inquiry — ' . ($business !== '' ? $business : $name);

$body = "New inquiry from the Simplee Creative website\n"
      . "--------------------------------------------\n"
      . "Name:     $name\n"
      . "Email:    $email\n"
      . "Business: " . ($business !== '' ? $business : '—') . "\n"
      . "Needs:    " . ($need !== '' ? $need : '—') . "\n\n"
      . $message . "\n";

$headers = [
    'From: Simplee Creative Website <noreply@' . $host . '>',
    'Reply-To: ' . $name . ' <' . $email . '>',
    'X-Mailer: PHP/' . PHP_VERSION,
    'Content-Type: text/plain; charset=UTF-8',
];

$sent = mail(RECIPIENT, $subject, $body, implode("\r\n", $headers));

if ($sent) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Mail delivery failed']);
}
