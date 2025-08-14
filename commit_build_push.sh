if [ -z "$1" ]; then
  echo "Error: No commit message provided. Usage: ./commit_build_push.sh \"Your commit message\""
  exit 1
fi

git add .
git commit -m "$1"
git push
docker build -t ghcr.io/tntredstone/calvinsteckphoto-admin:latest .
docker push ghcr.io/tntredstone/calvinsteckphoto-admin:latest
