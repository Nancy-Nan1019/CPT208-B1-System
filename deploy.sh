#!/bin/bash

APP_NAME="discussion-platform"
JAR_NAME="target/${APP_NAME}-1.0.0.jar"
LOG_FILE="app.log"

echo ">>> 停止旧进程..."
PID=$(pgrep -f "${APP_NAME}.*\.jar")
if [ -n "$PID" ]; then
    kill -9 $PID
    echo "已终止进程: $PID"
    sleep 2
else
    echo "无运行中的进程"
fi

echo ">>> Maven 打包（跳过测试）..."
mvn clean package -DskipTests
if [ $? -ne 0 ]; then
    echo "打包失败，终止部署"
    exit 1
fi

echo ">>> 后台启动..."
nohup java -jar $JAR_NAME > $LOG_FILE 2>&1 &
echo "启动完成，PID: $!, 日志: $LOG_FILE"
