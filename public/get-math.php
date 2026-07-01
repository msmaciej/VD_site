<?php
/**
 * get-math.php
 * Generates a simple math challenge for the VortexDeep fit check gate form.
 * Stores the correct answer in a PHP session — never exposed to the client.
 * Called via fetch() from check.astro when the gate form is shown.
 */
session_start();

$n1 = rand(2, 9);
$n2 = rand(2, 9);
$_SESSION['vd_math_sum'] = $n1 + $n2;

header('Content-Type: application/json');
echo json_encode(['question' => "$n1 + $n2"]);
