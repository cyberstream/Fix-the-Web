<?php
// Configure Twitter OAuth with the right credentials
$tmhOAuth_config = array(
  'consumer_key'    => '',
  'consumer_secret' => '',
);

$FixTheWeb = new FixTheWeb(new tmhOAuth($tmhOAuth_config));
$logged_in = $FixTheWeb->isAuthed();
