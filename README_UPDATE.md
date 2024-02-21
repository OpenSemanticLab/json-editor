# Update Forked Repository - Docker Container

## Step 1: If not already done clone the forked repository

```bash
git clone https://github.com/OpenSemanticLab/json-editor.git tree-json-editor; cd tree-json-editor
```

## Step 2: Build the container

```bash
docker compose build
```

## Step 3: Run the container

```bash
docker compose up -d
```

## Additional commands

### Close the container

```bash
docker compose down -v
```

### Show HTTP requests

```bash
docker compose logs -f
```

### Stop the container without deleting

```bash
docker compose stop
```

### Start the container again

```bash
docker compose start
```