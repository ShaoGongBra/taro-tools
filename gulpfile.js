const gulp = require('gulp')
const typedoc = require("gulp-typedoc");

gulp.task("typedoc", function () {
  return gulp.src(["lib/**/*.d.ts"]).pipe(
    typedoc({
      out: "./docs/",
      name: "TaroTools文档",
      categorizeByGroup: false,
      disableSources: true,
      hideGenerator: true
    })
  );
});
