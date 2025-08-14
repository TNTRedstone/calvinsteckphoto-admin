if [ -z "$1" ]; then
  echo "Error: No commit message provided. Usage: ./commit_build_push.sh \"Your commit message\""
  exit 1
fi

echo ""
echo "Running: git add ."
echo ""
git add .
echo ""
echo "Running: git commit -m \"$1\""
echo ""
git commit -m "$1"
echo ""
echo "Running: git push"
echo ""
git push
echo ""
echo "Running: docker build -t ghcr.io/tntredstone/calvinsteckphoto-admin:latest ."
echo ""
docker build -t ghcr.io/tntredstone/calvinsteckphoto-admin:latest .
echo ""
echo "Running: docker push ghcr.io/tntredstone/calvinsteckphoto-admin:latest"
echo ""
docker push ghcr.io/tntredstone/calvinsteckphoto-admin:latest
