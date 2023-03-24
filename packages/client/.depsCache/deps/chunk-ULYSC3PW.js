import {
  useThemeProps
} from "./chunk-VEQ5P4GR.js";
import {
  _extends,
  init_extends
} from "./chunk-ZEIPKT2T.js";
import {
  require_prop_types
} from "./chunk-WM2OC5CN.js";
import {
  require_jsx_runtime
} from "./chunk-HFC6VKRH.js";
import {
  require_react
} from "./chunk-KY3Y3TWH.js";
import {
  __toESM
} from "./chunk-TFWDKVI3.js";

// ../../node_modules/@mui/x-date-pickers/LocalizationProvider/LocalizationProvider.js
init_extends();
var React = __toESM(require_react());
var import_prop_types = __toESM(require_prop_types());

// ../../node_modules/@mui/x-date-pickers/locales/utils/getPickersLocalization.js
init_extends();
var getPickersLocalization = (pickersTranslations) => {
  return {
    components: {
      MuiLocalizationProvider: {
        defaultProps: {
          localeText: _extends({}, pickersTranslations)
        }
      }
    }
  };
};

// ../../node_modules/@mui/x-date-pickers/locales/nlNL.js
var nlNLPickers = {
  // Calendar navigation
  previousMonth: "Vorige maand",
  nextMonth: "Volgende maand",
  // View navigation
  openPreviousView: "open vorige view",
  openNextView: "open volgende view",
  calendarViewSwitchingButtonAriaLabel: (view) => view === "year" ? "jaarweergave is geopend, schakel over naar kalenderweergave" : "kalenderweergave is geopend, switch naar jaarweergave",
  // DateRange placeholders
  start: "Start",
  end: "Einde",
  // Action bar
  cancelButtonLabel: "Annuleren",
  clearButtonLabel: "Resetten",
  okButtonLabel: "OK",
  todayButtonLabel: "Vandaag",
  // Clock labels
  clockLabelText: (view, time, adapter) => `Selecteer ${view}. ${time === null ? "Geen tijd geselecteerd" : `Geselecteerde tijd is ${adapter.format(time, "fullTime")}`}`,
  hoursClockNumberText: (hours) => `${hours} uren`,
  minutesClockNumberText: (minutes) => `${minutes} minuten`,
  secondsClockNumberText: (seconds) => `${seconds} seconden`,
  // Open picker labels
  openDatePickerDialogue: (rawValue, utils) => rawValue && utils.isValid(utils.date(rawValue)) ? `Kies datum, geselecteerde datum is ${utils.format(utils.date(rawValue), "fullDate")}` : "Kies datum",
  openTimePickerDialogue: (rawValue, utils) => rawValue && utils.isValid(utils.date(rawValue)) ? `Kies tijd, geselecteerde tijd is ${utils.format(utils.date(rawValue), "fullTime")}` : "Kies tijd",
  // Table labels
  timeTableLabel: "kies tijd",
  dateTableLabel: "kies datum"
};
var nlNL = getPickersLocalization(nlNLPickers);

// ../../node_modules/@mui/x-date-pickers/locales/ptBR.js
var ptBRPickers = {
  // Calendar navigation
  previousMonth: "Mês anterior",
  nextMonth: "Próximo mês",
  // View navigation
  openPreviousView: "Abrir próxima seleção",
  openNextView: "Abrir seleção anterior",
  calendarViewSwitchingButtonAriaLabel: (view) => view === "year" ? "Seleção de ano está aberta, alternando para seleção de calendário" : "Seleção de calendários está aberta, alternando para seleção de ano",
  // DateRange placeholders
  start: "Início",
  end: "Fim",
  // Action bar
  cancelButtonLabel: "Cancelar",
  clearButtonLabel: "Limpar",
  okButtonLabel: "OK",
  todayButtonLabel: "Hoje",
  // Clock labels
  clockLabelText: (view, time, adapter) => `Selecione ${view}. ${time === null ? "Hora não selecionada" : `Selecionado a hora ${adapter.format(time, "fullTime")}`}`,
  hoursClockNumberText: (hours) => `${hours} horas`,
  minutesClockNumberText: (minutes) => `${minutes} minutos`,
  secondsClockNumberText: (seconds) => `${seconds} segundos`,
  // Open picker labels
  openDatePickerDialogue: (rawValue, utils) => rawValue && utils.isValid(utils.date(rawValue)) ? `Escolha uma data, data selecionada ${utils.format(utils.date(rawValue), "fullDate")}` : "Escolha uma data",
  openTimePickerDialogue: (rawValue, utils) => rawValue && utils.isValid(utils.date(rawValue)) ? `Escolha uma hora, hora selecionada ${utils.format(utils.date(rawValue), "fullTime")}` : "Escolha uma hora",
  // Table labels
  timeTableLabel: "escolha uma hora",
  dateTableLabel: "escolha uma data"
};
var ptBR = getPickersLocalization(ptBRPickers);

// ../../node_modules/@mui/x-date-pickers/locales/trTR.js
var trTRPickers = {
  // Calendar navigation
  previousMonth: "Önceki ay",
  nextMonth: "Sonraki ay",
  // View navigation
  openPreviousView: "sonraki görünüm",
  openNextView: "önceki görünüm",
  // calendarViewSwitchingButtonAriaLabel: (view: CalendarPickerView) => view === 'year' ? 'year view is open, switch to calendar view' : 'calendar view is open, switch to year view',
  // DateRange placeholders
  start: "Başlangıç",
  end: "Bitiş",
  // Action bar
  cancelButtonLabel: "iptal",
  clearButtonLabel: "Temizle",
  okButtonLabel: "Tamam",
  todayButtonLabel: "Bugün"
  // Clock labels
  // clockLabelText: (view, time, adapter) => `Select ${view}. ${time === null ? 'No time selected' : `Selected time is ${adapter.format(time, 'fullTime')}`}`,
  // hoursClockNumberText: hours => `${hours} hours`,
  // minutesClockNumberText: minutes => `${minutes} minutes`,
  // secondsClockNumberText: seconds => `${seconds} seconds`,
  // Open picker labels
  // openDatePickerDialogue: (rawValue, utils) => rawValue && utils.isValid(utils.date(rawValue)) ? `Choose date, selected date is ${utils.format(utils.date(rawValue)!, 'fullDate')}` : 'Choose date',
  // openTimePickerDialogue: (rawValue, utils) => rawValue && utils.isValid(utils.date(rawValue)) ? `Choose time, selected time is ${utils.format(utils.date(rawValue)!, 'fullTime')}` : 'Choose time',
  // Table labels
  // timeTableLabel: 'pick time',
  // dateTableLabel: 'pick date',
};
var trTR = getPickersLocalization(trTRPickers);

// ../../node_modules/@mui/x-date-pickers/locales/deDE.js
var views = {
  hours: "Stunden",
  minutes: "Minuten",
  seconds: "Sekunden"
};
var deDEPickers = {
  // Calendar navigation
  previousMonth: "Letzter Monat",
  nextMonth: "Nächster Monat",
  // View navigation
  openPreviousView: "Letzte Ansicht öffnen",
  openNextView: "Nächste Ansicht öffnen",
  calendarViewSwitchingButtonAriaLabel: (view) => view === "year" ? "Jahresansicht ist geöffnet, zur Kalenderansicht wechseln" : "Kalenderansicht ist geöffnet, zur Jahresansicht wechseln",
  // DateRange placeholders
  start: "Beginn",
  end: "Ende",
  // Action bar
  cancelButtonLabel: "Abbrechen",
  clearButtonLabel: "Löschen",
  okButtonLabel: "OK",
  todayButtonLabel: "Heute",
  // Clock labels
  clockLabelText: (view, time, adapter) => {
    var _views$view;
    return `${(_views$view = views[view]) != null ? _views$view : view} auswählen. ${time === null ? "Keine Uhrzeit ausgewählt" : `Gewählte Uhrzeit ist ${adapter.format(time, "fullTime")}`}`;
  },
  hoursClockNumberText: (hours) => `${hours} ${views.hours}`,
  minutesClockNumberText: (minutes) => `${minutes} ${views.minutes}`,
  secondsClockNumberText: (seconds) => `${seconds}  ${views.seconds}`,
  // Open picker labels
  openDatePickerDialogue: (rawValue, utils) => rawValue && utils.isValid(utils.date(rawValue)) ? `Datum auswählen, gewähltes Datum ist ${utils.format(utils.date(rawValue), "fullDate")}` : "Datum auswählen",
  openTimePickerDialogue: (rawValue, utils) => rawValue && utils.isValid(utils.date(rawValue)) ? `Uhrzeit auswählen, gewählte Uhrzeit ist ${utils.format(utils.date(rawValue), "fullTime")}` : "Uhrzeit auswählen",
  // Table labels
  timeTableLabel: "Uhrzeit auswählen",
  dateTableLabel: "Datum auswählen"
};
var deDE = getPickersLocalization(deDEPickers);

// ../../node_modules/@mui/x-date-pickers/locales/esES.js
var views2 = {
  hours: "las horas",
  minutes: "los minutos",
  seconds: "los segundos"
};
var esESPickers = {
  // Calendar navigation
  previousMonth: "Último mes",
  nextMonth: "Próximo mes",
  // View navigation
  openPreviousView: "abrir la última vista",
  openNextView: "abrir la siguiente vista",
  calendarViewSwitchingButtonAriaLabel: (view) => view === "year" ? "la vista del año está abierta, cambie a la vista de calendario" : "la vista de calendario está abierta, cambie a la vista del año",
  // DateRange placeholders
  start: "Empezar",
  end: "Terminar",
  // Action bar
  cancelButtonLabel: "Cancelar",
  clearButtonLabel: "Limpia",
  okButtonLabel: "OK",
  todayButtonLabel: "Hoy",
  // Clock labels
  clockLabelText: (view, time, adapter) => `Seleccione ${views2[view]}. ${time === null ? "Sin tiempo seleccionado" : `El tiempo seleccionado es ${adapter.format(time, "fullTime")}`}`,
  hoursClockNumberText: (hours) => `${hours} horas`,
  minutesClockNumberText: (minutes) => `${minutes} minutos`,
  secondsClockNumberText: (seconds) => `${seconds} segundos`,
  // Open picker labels
  openDatePickerDialogue: (rawValue, utils) => rawValue && utils.isValid(utils.date(rawValue)) ? `Elige la fecha, la fecha elegida es ${utils.format(utils.date(rawValue), "fullDate")}` : "Elige la fecha",
  openTimePickerDialogue: (rawValue, utils) => rawValue && utils.isValid(utils.date(rawValue)) ? `Elige la hora, la hora elegido es ${utils.format(utils.date(rawValue), "fullTime")}` : "Elige la hora",
  // Table labels
  timeTableLabel: "elige la fecha",
  dateTableLabel: "elige la hora"
};
var esES = getPickersLocalization(esESPickers);

// ../../node_modules/@mui/x-date-pickers/locales/frFR.js
var views3 = {
  hours: "heures",
  minutes: "minutes",
  seconds: "secondes"
};
var frFRPickers = {
  // Calendar navigation
  previousMonth: "Mois précédent",
  nextMonth: "Mois suivant",
  // View navigation
  openPreviousView: "Ouvrir la vue précédente",
  openNextView: "Ouvrir la vue suivante",
  calendarViewSwitchingButtonAriaLabel: (view) => view === "year" ? "La vue année est ouverte, ouvrir la vue calendrier" : "La vue calendrier est ouverte, ouvrir la vue année",
  // DateRange placeholders
  start: "Début",
  end: "Fin",
  // Action bar
  cancelButtonLabel: "Annuler",
  clearButtonLabel: "Vider",
  okButtonLabel: "OK",
  todayButtonLabel: "Aujourd'hui",
  // Clock labels
  clockLabelText: (view, time, adapter) => `Choix des ${views3[view]}. ${time === null ? "Aucune heure choisie" : `L'heure choisie est ${adapter.format(time, "fullTime")}`}`,
  hoursClockNumberText: (hours) => `${hours} heures`,
  minutesClockNumberText: (minutes) => `${minutes} minutes`,
  secondsClockNumberText: (seconds) => `${seconds} secondes`,
  // Open picker labels
  openDatePickerDialogue: (rawValue, utils) => rawValue && utils.isValid(utils.date(rawValue)) ? `Choisir la date, la date sélectionnée est ${utils.format(utils.date(rawValue), "fullDate")}` : "Choisir la date",
  openTimePickerDialogue: (rawValue, utils) => rawValue && utils.isValid(utils.date(rawValue)) ? `Choisir l'heure, l'heure sélectionnée est ${utils.format(utils.date(rawValue), "fullTime")}` : "Choisir l'heure",
  // Table labels
  timeTableLabel: "choix de l'heure",
  dateTableLabel: "choix de la date"
};
var frFR = getPickersLocalization(frFRPickers);

// ../../node_modules/@mui/x-date-pickers/locales/enUS.js
var enUSPickers = {
  // Calendar navigation
  previousMonth: "Previous month",
  nextMonth: "Next month",
  // View navigation
  openPreviousView: "open previous view",
  openNextView: "open next view",
  calendarViewSwitchingButtonAriaLabel: (view) => view === "year" ? "year view is open, switch to calendar view" : "calendar view is open, switch to year view",
  // DateRange placeholders
  start: "Start",
  end: "End",
  // Action bar
  cancelButtonLabel: "Cancel",
  clearButtonLabel: "Clear",
  okButtonLabel: "OK",
  todayButtonLabel: "Today",
  // Clock labels
  clockLabelText: (view, time, adapter) => `Select ${view}. ${time === null ? "No time selected" : `Selected time is ${adapter.format(time, "fullTime")}`}`,
  hoursClockNumberText: (hours) => `${hours} hours`,
  minutesClockNumberText: (minutes) => `${minutes} minutes`,
  secondsClockNumberText: (seconds) => `${seconds} seconds`,
  // Open picker labels
  openDatePickerDialogue: (rawValue, utils) => rawValue && utils.isValid(utils.date(rawValue)) ? `Choose date, selected date is ${utils.format(utils.date(rawValue), "fullDate")}` : "Choose date",
  openTimePickerDialogue: (rawValue, utils) => rawValue && utils.isValid(utils.date(rawValue)) ? `Choose time, selected time is ${utils.format(utils.date(rawValue), "fullTime")}` : "Choose time",
  // Table labels
  timeTableLabel: "pick time",
  dateTableLabel: "pick date"
};
var DEFAULT_LOCALE = enUSPickers;
var enUS = getPickersLocalization(enUSPickers);

// ../../node_modules/@mui/x-date-pickers/locales/nbNO.js
var nbNOPickers = {
  // Calendar navigation
  previousMonth: "Forrige måned",
  nextMonth: "Neste måned",
  // View navigation
  openPreviousView: "åpne forrige visning",
  openNextView: "åpne neste visning",
  calendarViewSwitchingButtonAriaLabel: (view) => view === "year" ? "årsvisning er åpen, bytt til kalendervisning" : "kalendervisning er åpen, bytt til årsvisning",
  // DateRange placeholders
  start: "Start",
  end: "Slutt",
  // Action bar
  cancelButtonLabel: "Avbryt",
  clearButtonLabel: "Fjern",
  okButtonLabel: "OK",
  todayButtonLabel: "I dag",
  // Clock labels
  clockLabelText: (view, time, adapter) => `Velg ${view}. ${time === null ? "Ingen tid valgt" : `Valgt tid er ${adapter.format(time, "fullTime")}`}`,
  hoursClockNumberText: (hours) => `${hours} timer`,
  minutesClockNumberText: (minutes) => `${minutes} minutter`,
  secondsClockNumberText: (seconds) => `${seconds} sekunder`,
  // Open picker labels
  openDatePickerDialogue: (rawValue, utils) => rawValue && utils.isValid(utils.date(rawValue)) ? `Velg dato, valgt dato er ${utils.format(utils.date(rawValue), "fullDate")}` : "Velg dato",
  openTimePickerDialogue: (rawValue, utils) => rawValue && utils.isValid(utils.date(rawValue)) ? `Velg tid, valgt tid er ${utils.format(utils.date(rawValue), "fullTime")}` : "Velg tid",
  // Table labels
  timeTableLabel: "velg tid",
  dateTableLabel: "velg dato"
};
var nbNO = getPickersLocalization(nbNOPickers);

// ../../node_modules/@mui/x-date-pickers/locales/svSE.js
var svSEPickers = {
  // Calendar navigation
  previousMonth: "Föregående månad",
  nextMonth: "Nästa månad",
  // View navigation
  openPreviousView: "öppna föregående vy",
  openNextView: "öppna nästa vy",
  calendarViewSwitchingButtonAriaLabel: (view) => view === "year" ? "årsvyn är öppen, byt till kalendervy" : "kalendervyn är öppen, byt till årsvy",
  // DateRange placeholders
  start: "Start",
  end: "Slut",
  // Action bar
  cancelButtonLabel: "Avbryt",
  clearButtonLabel: "Rensa",
  okButtonLabel: "OK",
  todayButtonLabel: "Idag",
  // Clock labels
  clockLabelText: (view, time, adapter) => `Select ${view}. ${time === null ? "Ingen tid vald" : `Vald tid är ${adapter.format(time, "fullTime")}`}`,
  hoursClockNumberText: (hours) => `${hours} timmar`,
  minutesClockNumberText: (minutes) => `${minutes} minuter`,
  secondsClockNumberText: (seconds) => `${seconds} sekunder`,
  // Open picker labels
  openDatePickerDialogue: (rawValue, utils) => rawValue && utils.isValid(utils.date(rawValue)) ? `Välj datum, valt datum är ${utils.format(utils.date(rawValue), "fullDate")}` : "Välj datum",
  openTimePickerDialogue: (rawValue, utils) => rawValue && utils.isValid(utils.date(rawValue)) ? `Välj tid, vald tid är ${utils.format(utils.date(rawValue), "fullTime")}` : "Välj tid",
  // Table labels
  timeTableLabel: "välj tid",
  dateTableLabel: "välj datum"
};
var svSE = getPickersLocalization(svSEPickers);

// ../../node_modules/@mui/x-date-pickers/locales/itIT.js
var views4 = {
  hours: "le ore",
  minutes: "i minuti",
  seconds: "i secondi"
};
var itITPickers = {
  // Calendar navigation
  previousMonth: "Mese precedente",
  nextMonth: "Mese successivo",
  // View navigation
  openPreviousView: "apri la vista precedente",
  openNextView: "apri la vista successiva",
  calendarViewSwitchingButtonAriaLabel: (view) => view === "year" ? "la vista dell'anno è aperta, passare alla vista del calendario" : "la vista dell'calendario è aperta, passare alla vista dell'anno",
  // DateRange placeholders
  start: "Inizio",
  end: "Fine",
  // Action bar
  cancelButtonLabel: "Cancellare",
  clearButtonLabel: "Sgomberare",
  okButtonLabel: "OK",
  todayButtonLabel: "Oggi",
  // Clock labels
  clockLabelText: (view, time, adapter) => `Seleziona ${views4[view]}. ${time === null ? "Nessun orario selezionato" : `L'ora selezionata è ${adapter.format(time, "fullTime")}`}`,
  hoursClockNumberText: (hours) => `${hours} ore`,
  minutesClockNumberText: (minutes) => `${minutes} minuti`,
  secondsClockNumberText: (seconds) => `${seconds} secondi`,
  // Open picker labels
  openDatePickerDialogue: (rawValue, utils) => rawValue && utils.isValid(utils.date(rawValue)) ? `Scegli la data, la data selezionata è ${utils.format(utils.date(rawValue), "fullDate")}` : "Scegli la data",
  openTimePickerDialogue: (rawValue, utils) => rawValue && utils.isValid(utils.date(rawValue)) ? `Scegli l'ora, l'ora selezionata è ${utils.format(utils.date(rawValue), "fullTime")}` : "Scegli l'ora",
  // Table labels
  timeTableLabel: "scegli un ora",
  dateTableLabel: "scegli una data"
};
var itIT = getPickersLocalization(itITPickers);

// ../../node_modules/@mui/x-date-pickers/locales/zhCN.js
var views5 = {
  hours: "小时",
  minutes: "分钟",
  seconds: "秒"
};
var zhCNPickers = {
  // Calendar navigation
  previousMonth: "上个月",
  nextMonth: "下个月",
  // View navigation
  openPreviousView: "前一个视图",
  openNextView: "下一个视图",
  calendarViewSwitchingButtonAriaLabel: (view) => view === "year" ? "年视图已打开，切换为日历视图" : "日历视图已打开，切换为年视图",
  // DateRange placeholders
  start: "开始",
  end: "结束",
  // Action bar
  cancelButtonLabel: "取消",
  clearButtonLabel: "清除",
  okButtonLabel: "确认",
  todayButtonLabel: "今天",
  // Clock labels
  clockLabelText: (view, time, adapter) => `Select ${views5[view]}. ${time === null ? "未选择时间" : `已选择${adapter.format(time, "fullTime")}`}`,
  hoursClockNumberText: (hours) => `${hours}小时`,
  minutesClockNumberText: (minutes) => `${minutes}分钟`,
  secondsClockNumberText: (seconds) => `${seconds}秒`,
  // Open picker labels
  openDatePickerDialogue: (rawValue, utils) => rawValue && utils.isValid(utils.date(rawValue)) ? `选择日期，已选择${utils.format(utils.date(rawValue), "fullDate")}` : "选择日期",
  openTimePickerDialogue: (rawValue, utils) => rawValue && utils.isValid(utils.date(rawValue)) ? `选择时间，已选择${utils.format(utils.date(rawValue), "fullTime")}` : "选择时间",
  // Table labels
  timeTableLabel: "选择时间",
  dateTableLabel: "选择日期"
};
var zhCN = getPickersLocalization(zhCNPickers);

// ../../node_modules/@mui/x-date-pickers/LocalizationProvider/LocalizationProvider.js
var import_jsx_runtime = __toESM(require_jsx_runtime());
var MuiPickersAdapterContext = React.createContext(null);
if (true) {
  MuiPickersAdapterContext.displayName = "MuiPickersAdapterContext";
}
var warnedOnce = false;
function LocalizationProvider(inProps) {
  const props = useThemeProps({
    props: inProps,
    name: "MuiLocalizationProvider"
  });
  const {
    children,
    dateAdapter: Utils,
    dateFormats,
    dateLibInstance,
    locale,
    adapterLocale,
    localeText
  } = props;
  if (true) {
    if (!warnedOnce && locale !== void 0) {
      warnedOnce = true;
      console.warn("LocalizationProvider's prop `locale` is deprecated and replaced by `adapterLocale`");
    }
  }
  const utils = React.useMemo(() => new Utils({
    locale: adapterLocale != null ? adapterLocale : locale,
    formats: dateFormats,
    instance: dateLibInstance
  }), [Utils, locale, adapterLocale, dateFormats, dateLibInstance]);
  const defaultDates = React.useMemo(() => {
    return {
      minDate: utils.date("1900-01-01T00:00:00.000"),
      maxDate: utils.date("2099-12-31T00:00:00.000")
    };
  }, [utils]);
  const contextValue = React.useMemo(() => {
    return {
      utils,
      defaultDates,
      localeText: _extends({}, DEFAULT_LOCALE, localeText != null ? localeText : {})
    };
  }, [defaultDates, utils, localeText]);
  return (0, import_jsx_runtime.jsx)(MuiPickersAdapterContext.Provider, {
    value: contextValue,
    children
  });
}
true ? LocalizationProvider.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "yarn proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * Locale for the date library you are using
   */
  adapterLocale: import_prop_types.default.oneOfType([import_prop_types.default.object, import_prop_types.default.string]),
  children: import_prop_types.default.node,
  /**
   * DateIO adapter class function
   */
  dateAdapter: import_prop_types.default.func.isRequired,
  /**
   * Formats that are used for any child pickers
   */
  dateFormats: import_prop_types.default.shape({
    dayOfMonth: import_prop_types.default.string,
    fullDate: import_prop_types.default.string,
    fullDateTime: import_prop_types.default.string,
    fullDateTime12h: import_prop_types.default.string,
    fullDateTime24h: import_prop_types.default.string,
    fullDateWithWeekday: import_prop_types.default.string,
    fullTime: import_prop_types.default.string,
    fullTime12h: import_prop_types.default.string,
    fullTime24h: import_prop_types.default.string,
    hours12h: import_prop_types.default.string,
    hours24h: import_prop_types.default.string,
    keyboardDate: import_prop_types.default.string,
    keyboardDateTime: import_prop_types.default.string,
    keyboardDateTime12h: import_prop_types.default.string,
    keyboardDateTime24h: import_prop_types.default.string,
    minutes: import_prop_types.default.string,
    month: import_prop_types.default.string,
    monthAndDate: import_prop_types.default.string,
    monthAndYear: import_prop_types.default.string,
    monthShort: import_prop_types.default.string,
    normalDate: import_prop_types.default.string,
    normalDateWithWeekday: import_prop_types.default.string,
    seconds: import_prop_types.default.string,
    shortDate: import_prop_types.default.string,
    weekday: import_prop_types.default.string,
    weekdayShort: import_prop_types.default.string,
    year: import_prop_types.default.string
  }),
  /**
   * Date library instance you are using, if it has some global overrides
   * ```jsx
   * dateLibInstance={momentTimeZone}
   * ```
   */
  dateLibInstance: import_prop_types.default.any,
  /**
   * Locale for the date library you are using
   * @deprecated Use `adapterLocale` instead
   */
  locale: import_prop_types.default.oneOfType([import_prop_types.default.object, import_prop_types.default.string]),
  /**
   * Locale for components texts
   */
  localeText: import_prop_types.default.object
} : void 0;

export {
  MuiPickersAdapterContext,
  LocalizationProvider
};
//# sourceMappingURL=chunk-ULYSC3PW.js.map
