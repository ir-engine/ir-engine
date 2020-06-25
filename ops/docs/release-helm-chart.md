# Create New Chart Version

To create a new version from the chart you will need to install chartpress via:

``` bash
pip install chartpress
```

then run following commands:

``` bash
git checkout master
git tag 0.1.0
chartpress --publish-chart
git clean -xffd
```

the branch can be any branch have the required chart features, the tag will be the chart tag you need.

Also checkout the branch **gh-pages** for the jykell deployment
