use Mojolicious::Lite;
use DateTime;
use Encode;
use JSON;
use utf8;

# 設定ファイルを読み込み
my $config = plugin('Config', {file => 'app.conf'});

# 接続人数
my $clients = {};

# Template with browser-side code
get '/' => 'index';

# WebSocket echo service
websocket '/echo' => sub {
  my $c = shift;

  my $id = sprintf "%s", $c->tx;
  $clients->{$id} = $c->tx;

  # Opened
  $c->app->log->debug('WebSocket opened.');
  $c->app->log->debug('WebSocket opened client = ' . $id);

  # Increase inactivity timeout for connection a bit
  $c->inactivity_timeout(300);

  # Incoming message
  $c->on(message => sub {
    my ($c, $msg) = @_;

    $c->app->log->debug('mesage->' . $msg);

    my $dt   = DateTime->now( time_zone => 'Asia/Tokyo');

    for (keys %$clients) {
      my $_msg = "$msg";
      $clients->{$_}->send(JSON->new->utf8(0)->encode({
        hms  => $dt->hms,
        text => $_msg,
       }));
    }

  });

  # Closed
  $c->on(finish => sub {
    my ($c, $code, $reason) = @_;
    $c->app->log->debug("WebSocket closed with status $code.");
    $c->app->log->debug("WebSocket closed with client = " . $id);
    delete $clients->{$id};
  });
};

app->start;
