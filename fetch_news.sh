#!/bin/bash
cd "$(dirname "$0")"
for script in workers/providers/*.py; do
    echo "Running $script..."
    /home/vahid/contentoire-env/bin/python "$script"
done
