<?php
echo "Backend Test - PHP Working!";
echo "<br>";
echo "Current Directory: " . getcwd();
echo "<br>";
echo "Files in public_html: ";
print_r(scandir('.'));
?>