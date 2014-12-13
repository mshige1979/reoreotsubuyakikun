var myApp = angular.module('myApp', ['ui.bootstrap']);

myApp.factory('EchoScoket', function($rootScope, $log){

    var service = {};
    var ws;

    service = {
        // websocket path
        path: "",

        // 接続状態
        connected: 0,

        //
        messageList: [],

        // 接続
        connect: function(){
            // オブジェクト生成
            ws = new WebSocket(service.path);
            $log.log(ws);

            // 接続
            ws.onopen = function(){
                $log.log("websocket connect");
            };

            // メッセージ受信
            ws.onmessage = function(message){
                $log.log("websocket reserve message")

                var res = JSON.parse(message.data);

                // 先頭に追加する
                service.messageList.unshift(res);

                // すぐに反映されないのでここで同期する
                $rootScope.$apply(service.messageList);
            };

            // 切断
            ws.onclose = function(){
                $log.log("websocket disconnect");
                service.connected = 2;
            };

            service.connected = 1;

        },

        // メッセージ送信
        send: function(message){
            if(message != ""){
                ws.send(message);
            }
        }
    };

    return service;
});

myApp.controller('MainCtrl', function($scope, $log, EchoScoket){

    $scope.EchoScoket = EchoScoket;
    $scope.message = "";

    // message clear
    $scope.messageClear = function(){
        $scope.message = "";
    }

    // message send
    $scope.messageSend = function(){
        EchoScoket.send($scope.message);
        $scope.message = "";
    }

    // enter key send
    $scope.handleKeydown = function(e) {
        if (e.which == 13) {
            EchoScoket.send($scope.message);
            $scope.message = '';
        }
    }

    // 初回にのみ実行され、websocketの接続処理を実施
    $scope.$watch('EchoScoket.path', function(newVal, oldVal) {
        EchoScoket.connect();
    });

    $scope.$watch('EchoScoket.connected', function(newVal, oldVal) {
        if(newVal == 2){
            EchoScoket.connect();
        }
    });
});

