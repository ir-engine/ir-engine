  import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import config from "config";
import inject from '@rollup/plugin-inject'
import OptimizationPersist from 'vite-plugin-optimize-persist'
import PkgConfig from 'vite-plugin-package-config'

const replaceEnvs = (obj, env) => {
  let result = {};

  for (let key of Object.keys(obj)) {
    if (typeof obj[key] === 'object') {
      result[key] = replaceEnvs(obj[key], env);
      continue;
    }

    result[key] = obj[key];

    if (typeof obj[key] !== 'string') {
      continue;
    }

    const matches = Array.from(obj[key].matchAll(/\$\{[^}]*\}+/g), m => m[0]);

    for (let match of matches) {
      result[key] = result[key].replace(match, env[match.substring(2, match.length - 1)])
    }
  }

  return result;
}

export default defineConfig((command) => {
  const env = loadEnv('', process.cwd() + '../../');
  const runtime = replaceEnvs(config.get('publicRuntimeConfig'), env);

  process.env = {
    ...process.env,
    ...env,
    publicRuntimeConfig: JSON.stringify(runtime)
  };

  const returned = {
    optimizeDeps: {
      include: [
        '@xrengine/projects',
        "@feathersjs/client",
        "@feathersjs/feathers",
        "@feathersjs/rest-client",
        "@google/model-viewer",
        "@hookstate/core",
        "@hookstate/devtools",
        "@mapbox/geojson-rewind",
        "@mapbox/vector-tile",
        "@material-ui/core",
        "@material-ui/core/Accordion",
        "@material-ui/core/AccordionDetails",
        "@material-ui/core/AccordionSummary",
        "@material-ui/core/AppBar",
        "@material-ui/core/Avatar",
        "@material-ui/core/Backdrop",
        "@material-ui/core/Badge",
        "@material-ui/core/Box",
        "@material-ui/core/Button",
        "@material-ui/core/Card",
        "@material-ui/core/CardContent",
        "@material-ui/core/CardMedia",
        "@material-ui/core/Checkbox",
        "@material-ui/core/Chip",
        "@material-ui/core/CircularProgress",
        "@material-ui/core/ClickAwayListener",
        "@material-ui/core/Collapse",
        "@material-ui/core/Container",
        "@material-ui/core/CssBaseline",
        "@material-ui/core/Dialog",
        "@material-ui/core/DialogActions",
        "@material-ui/core/DialogContent",
        "@material-ui/core/DialogContentText",
        "@material-ui/core/DialogTitle",
        "@material-ui/core/Divider",
        "@material-ui/core/Drawer",
        "@material-ui/core/Fab",
        "@material-ui/core/Fade",
        "@material-ui/core/FormControl",
        "@material-ui/core/FormControlLabel",
        "@material-ui/core/FormGroup",
        "@material-ui/core/FormHelperText",
        "@material-ui/core/Grid",
        "@material-ui/core/Grow",
        "@material-ui/core/IconButton",
        "@material-ui/core/InputAdornment",
        "@material-ui/core/InputBase",
        "@material-ui/core/InputLabel",
        "@material-ui/core/List",
        "@material-ui/core/ListItem",
        "@material-ui/core/ListItemAvatar",
        "@material-ui/core/ListItemIcon",
        "@material-ui/core/ListItemText",
        "@material-ui/core/ListSubheader",
        "@material-ui/core/MenuItem",
        "@material-ui/core/MenuList",
        "@material-ui/core/Modal",
        "@material-ui/core/Paper",
        "@material-ui/core/Popper",
        "@material-ui/core/Radio",
        "@material-ui/core/RadioGroup",
        "@material-ui/core/Select",
        "@material-ui/core/Slider",
        "@material-ui/core/Snackbar",
        "@material-ui/core/SvgIcon",
        "@material-ui/core/SwipeableDrawer",
        "@material-ui/core/Switch",
        "@material-ui/core/Tab",
        "@material-ui/core/Table",
        "@material-ui/core/TableBody",
        "@material-ui/core/TableCell",
        "@material-ui/core/TableContainer",
        "@material-ui/core/TableHead",
        "@material-ui/core/TablePagination",
        "@material-ui/core/TableRow",
        "@material-ui/core/Tabs",
        "@material-ui/core/TextField",
        "@material-ui/core/Toolbar",
        "@material-ui/core/Tooltip",
        "@material-ui/core/Typography",
        "@material-ui/core/colors",
        "@material-ui/core/styles",
        "@material-ui/icons",
        "@material-ui/icons/AccountCircle",
        "@material-ui/icons/Add",
        "@material-ui/icons/ArrowBack",
        "@material-ui/icons/Close",
        "@material-ui/icons/Delete",
        "@material-ui/icons/Email",
        "@material-ui/icons/EmojiPeople",
        "@material-ui/icons/ExpandLess",
        "@material-ui/icons/ExpandMore",
        "@material-ui/icons/Face",
        "@material-ui/icons/Facebook",
        "@material-ui/icons/GitHub",
        "@material-ui/icons/Link",
        "@material-ui/icons/LinkedIn",
        "@material-ui/icons/LockOutlined",
        "@material-ui/icons/PermIdentity",
        "@material-ui/icons/Person",
        "@material-ui/icons/Public",
        "@material-ui/icons/RemoveFromQueue",
        "@material-ui/icons/Search",
        "@material-ui/icons/Settings",
        "@material-ui/icons/SupervisedUserCircle",
        "@material-ui/icons/Timeline",
        "@material-ui/icons/Twitter",
        "@material-ui/icons/ViewModule",
        "@material-ui/lab/Alert",
        "@material-ui/lab/AlertTitle",
        "@material-ui/lab/Autocomplete",
        "@material-ui/lab/ToggleButton",
        "@material-ui/lab/ToggleButtonGroup",
        "@material-ui/styles",
        "@styled-icons/boxicons-regular/CaretLeft",
        "@styled-icons/boxicons-regular/CaretRight",
        "@styled-icons/boxicons-regular/Grid",
        "@styled-icons/boxicons-regular/Sun",
        "@styled-icons/boxicons-solid/Extension",
        "@styled-icons/fa-regular/QuestionCircle",
        "@styled-icons/fa-solid",
        "@styled-icons/fa-solid/ArrowsAlt",
        "@styled-icons/fa-solid/ArrowsAltH",
        "@styled-icons/fa-solid/ArrowsAltV",
        "@styled-icons/fa-solid/Bars",
        "@styled-icons/fa-solid/Bolt",
        "@styled-icons/fa-solid/Bullseye",
        "@styled-icons/fa-solid/Camera",
        "@styled-icons/fa-solid/CaretDown",
        "@styled-icons/fa-solid/CaretRight",
        "@styled-icons/fa-solid/Certificate",
        "@styled-icons/fa-solid/ChartArea",
        "@styled-icons/fa-solid/City",
        "@styled-icons/fa-solid/Cloud",
        "@styled-icons/fa-solid/CloudUploadAlt",
        "@styled-icons/fa-solid/Cube",
        "@styled-icons/fa-solid/Cubes",
        "@styled-icons/fa-solid/EllipsisV",
        "@styled-icons/fa-solid/ExclamationTriangle",
        "@styled-icons/fa-solid/Globe",
        "@styled-icons/fa-solid/HandPaper",
        "@styled-icons/fa-solid/Image",
        "@styled-icons/fa-solid/Lightbulb",
        "@styled-icons/fa-solid/Link",
        "@styled-icons/fa-solid/Magnet",
        "@styled-icons/fa-solid/Map",
        "@styled-icons/fa-solid/Pause",
        "@styled-icons/fa-solid/Play",
        "@styled-icons/fa-solid/Plus",
        "@styled-icons/fa-solid/Rainbow",
        "@styled-icons/fa-solid/Running",
        "@styled-icons/fa-solid/SlidersH",
        "@styled-icons/fa-solid/SprayCan",
        "@styled-icons/fa-solid/SquareFull",
        "@styled-icons/fa-solid/StreetView",
        "@styled-icons/fa-solid/Sun",
        "@styled-icons/fa-solid/SyncAlt",
        "@styled-icons/fa-solid/Unlink",
        "@styled-icons/fa-solid/Video",
        "@styled-icons/fa-solid/VolumeUp",
        "@styled-icons/fa-solid/Water",
        "@styled-icons/material/Analytics/Analytics.esm",
        "@turf/turf",
        "@tweenjs/tween.js",
        "axios",
        "bitecs",
        "buffer",
        "classnames",
        "clsx",
        "comlink",
        "credential-handler-polyfill",
        "cross-fetch",
        "detect-browser",
        "dompurify",
        "draco3dgltf",
        "earcut",
        "ethereal",
        "eventemitter3",
        "events",
        "fuse.js",
        "hls.js",
        "hls.js/dist/hls.light",
        "i18next",
        "i18next-browser-languagedetector",
        "idb-keyval",
        "immutable",
        "jwt-decode",
        "lodash",
        "mediasoup-client",
        "moment",
        "mousetrap",
        "pbf",
        "polygon-clipping",
        "postprocessing",
        "prop-types",
        "querystring",
        "rc-dock",
        "rc-slider/es/Slider",
        "react",
        "react-apexcharts",
        "react-color/lib/Sketch",
        "react-contextmenu",
        "react-dnd",
        "react-dnd-html5-backend",
        "react-dom",
        "react-full-screen",
        "react-ga4",
        "react-helmet",
        "react-i18next",
        "react-infinite-scroller",
        "react-json-tree",
        "react-lottie",
        "react-modal",
        "react-redux",
        "react-router",
        "react-router-dom",
        "react-select",
        "react-select/creatable",
        "react-virtualized-auto-sizer",
        "react-window",
        "redux",
        "redux-devtools-extension",
        "redux-immutable",
        "redux-thunk",
        "simplex-noise",
        "socket.io-client",
        "styled-components",
        "three",
        "three-mesh-bvh",
        "troika-three-text",
        "url",
        "use-debounce",
        "uuid",
        "volumetric/web/decoder/Player",
        "web-worker",
        "yuka",
        "yup"
      ]
    },
    plugins: [
      PkgConfig(),
      OptimizationPersist()
    ],
    server: {
      host: true,
    },
    resolve: {
      alias: {
        'react-json-tree': 'react-json-tree/umd/react-json-tree',
        "socket.io-client": "socket.io-client/dist/socket.io.js",
        "react-infinite-scroller": "react-infinite-scroller/dist/InfiniteScroll",
        "ts-matches":"@xrengine/common/src/libs/ts-matches/matches.ts"
      }
    },
    build: {
      target: 'esnext',
      sourcemap: 'inline',
      minify: 'esbuild',
      dynamicImportVarsOptions: {
        warnOnError: true,
      },
      rollupOptions: {
        output: {
          dir: 'dist',
          format: 'es',
          // we may need this at some point for dynamically loading static asset files from src, keep it here
          // entryFileNames: `assets/[name].js`,
          // chunkFileNames: `assets/[name].js`,
          // assetFileNames: `assets/[name].[ext]`
        },
      },
    },
  };
  if(process.env.APP_ENV === 'development' || process.env.VITE_LOCAL_BUILD === 'true') {
    returned.server.https = {
      key: fs.readFileSync('../../certs/key.pem'),
      cert: fs.readFileSync('../../certs/cert.pem')
    }
  }
  if (command.command === 'build' && process.env.VITE_LOCAL_BUILD !== 'true') {
   returned.build.rollupOptions.plugins = [
       inject({
         process: 'process'
       })
   ]
  }
  if(command.command !=='build' || process.env.VITE_LOCAL_BUILD === 'true') { 
    returned.define = {
      'process.env': process.env,
      'process.browser': process.browser,
    }
  }
  return returned
});
