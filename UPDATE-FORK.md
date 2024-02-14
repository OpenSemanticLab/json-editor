# Update Forked Repository

## Step 1: Clone the forked repository

```bash
git clone https://github.com/OpenSemanticLab/json-editor.git tree-json-editor; cd tree-json-editor
```

## Step 2: Add remote from original repository in your forked repository branch update

```bash
git checkout update; git remote add upstream https://github.com/json-editor/json-editor
```

## Step 3: Check upstream

```bash
git remote -v
```

## Step 4: Fetch upstream

```bash
git fetch upstream
```

## Step 5: Merge changes from upstream to your local machine in to current branch

```bash
git merge upstream/master
```

## Step 6: Push changes to your forked repository

```bash
git push origin update
```

## Step 7: Remove upstream from your local machine

```bash
git remote rm upstream
```

## Step 8: Check your forked repository for changes

```bash
git log
```
