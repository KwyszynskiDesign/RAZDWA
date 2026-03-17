import { BannerView } from "../ui/views/banner";
import { CadUploadView } from "../ui/views/cad-upload";
import { CanvasView } from "../ui/views/canvas-fixed";
import { DrukCADView } from "../ui/views/druk-cad";
import { DrukA4A3SkanView } from "../ui/views/druk-a4-a3-skan-view";
import { DyplomyView } from "../ui/views/dyplomy";
import { FoliaSzronionaView } from "../ui/views/folia-szroniona";
import { LaminowanieView } from "../ui/views/laminowanie";
import { WydrukiSpecjalneView } from "../ui/views/wydruki-specjalne";
import { PlakatyView } from "../ui/views/plakaty";
import { RollUpView } from "../ui/views/roll-up";
import { UlotkiCyfroweView } from "../ui/views/ulotki-cyfrowe";
import { VoucheryView } from "../ui/views/vouchery";
import { WizytowkiView } from "../ui/views/wizytowki-druk-cyfrowy";
import { WlepkiView } from "../ui/views/wlepki-naklejki";
import { WycinanieFoliiView } from "../ui/views/wycinanie-folii";
import { ZaproszeniaKredaView } from "../ui/views/zaproszenia-kreda";
import { artykulyBiuroweCategory } from "./artykuly-biurowe";
import { uslugiCategory } from "./uslugi";

export const categories = [
  DrukA4A3SkanView,
  DrukCADView,
  CadUploadView,
  LaminowanieView,
  WydrukiSpecjalneView,
  BannerView,
  WizytowkiView,
  UlotkiCyfroweView,
  WlepkiView,
  RollUpView,
  DyplomyView,
  ZaproszeniaKredaView,
  FoliaSzronionaView,
  WycinanieFoliiView,
  CanvasView,
  VoucheryView,
  PlakatyView,
  artykulyBiuroweCategory,
  uslugiCategory,
];
