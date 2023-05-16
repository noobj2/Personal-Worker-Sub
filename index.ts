/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
  //
  // Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
  // MY_SERVICE: Fetcher;
}

/*!
 * v2ray Subscription Worker v1.6
 * Copyright 2023 Vahid Farid (https://twitter.com/vahidfarid)
 * Licensed under GPLv3 (https://github.com/vfarid/v2ray-worker-sub/blob/main/Licence.md)
 */

const MAX_CONFIGS_PER_OPERATOR: number = 10;
const INCLUDE_ORIGINAL: boolean = false;
const ONLY_ORIGINAL: boolean = false;
const SELECTED_TYPES: Array<string> = ["vmess", "vless", "trojan"];
const configProviders: Array<any> = [
  {
    name: "Personal",
    // Add your configs here
    configs: [
      // "vmess://",
      // "vless://",
      // "trojan://",
      // "",
    ],
  },
  {
    name: "Personal2",
    configs: [
      // "vmess://",
      // "vless://",
      // "trojan://"
    ],
  },
];

const ipProviderLink =
  "https://raw.githubusercontent.com/vfarid/cf-clean-ips/main/list.json";

var selectedTypes: Array<string> = SELECTED_TYPES;
var operators: Array<string> = ["MCI", "MTN", "FNV", "SMT"];
var cleanIPs: Array<any> = [];
var maxConfigsPerOperator: number = MAX_CONFIGS_PER_OPERATOR;
var includeOriginalConfigs: boolean = INCLUDE_ORIGINAL;
var onlyOriginalConfigs: boolean = ONLY_ORIGINAL;
const ipDomain = "ircf.space";
const ircfCleanIP: Array<any> = [
  {
    operatorName: "Mokhaberat",
    ipLinks: [`mkh.${ipDomain}`, `mkhx.${ipDomain}`],
  },
  {
    operatrName: "Irancell",
    ipLinks: [`mtn.${ipDomain}`, `mtnx.${ipDomain}`, `mtnc.${ipDomain}`],
  },
  {
    operatorName: "Hamrah Avval",
    ipLinks: [`mci.${ipDomain}`, `mcix.${ipDomain}`, `mcic.${ipDomain}`],
  },
  {
    operatorName: "Rightel",
    ipLinks: [`rtl.${ipDomain}`],
  },
  {
    operatorName: "MobinNet",
    ipLinks: [`mbt.${ipDomain}`],
  },
  {
    operatorName: "Highweb",
    ipLinks: [`hwb.${ipDomain}`],
  },
  {
    operatorName: "Asiatech",
    ipLinks: [`ast.${ipDomain}`],
  },
  {
    operatorName: "Pars Online",
    ipLinks: [`prs.${ipDomain}`],
  },
  {
    operatorName: "Shatel",
    ipLinks: [`sht.${ipDomain}`],
  },
  {
    operatorName: "Shatel Mobile",
    ipLinks: [`shm.${ipDomain}`],
  },
  {
    operatorName: "Zitel",
    ipLinks: [`ztl.${ipDomain}`],
  },
  {
    operatorName: "Andishe Sabz",
    ipLinks: [`ask.${ipDomain}`],
  },
  {
    operatorName: "Raspina",
    ipLinks: [`rsp.${ipDomain}`],
  },
  {
    operatorName: "Afranet",
    ipLinks: [`afn.${ipDomain}`],
  },
  {
    operatorName: "Pishgaman",
    ipLinks: [`psm.${ipDomain}`],
  },
  {
    operatorName: "Arax",
    ipLinks: [`arx.${ipDomain}`],
  },
  {
    operatorName: "Samantel",
    ipLinks: [`smt.${ipDomain}`],
  },
  {
    operatorName: "Fanava",
    ipLinks: [`fnv.${ipDomain}`],
  },
  {
    operatorName: "Aptel",
    ipLinks: [`apt.${ipDomain}`],
  },
  {
    operatorName: "Dideban Net",
    ipLinks: [`dbn.${ipDomain}`],
  },
];
var alpnList: Array<string> = [
  "h2,http/1.1",
  "h2,http/1.1",
  "h2,http/1.1",
  "http/1.1",
];
var fpList: Array<string> = [
  "chrome_auto",
  "edge_auto",
  "ios_auto",
  "firefox_auto",
  "android_11_okhttp",
  "safari_auto",
  "ios_13",
  "ios_14",
  "360_auto",
];
var domainList: Array<string> = [
  "discord.com",
  "laravel.com",
  "cdnjs.com",
  "www.speedtest.net",
  "speed.cloudflare.com",
  "workers.dev",
];

import { Buffer } from "buffer";

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/|\/$/g, "");
    const parts = path.split("/");
    const type = parts[0].toLowerCase();
    if (type === "sub") {
      try {
        cleanIPs = await fetch(ipProviderLink)
          .then((r: Response) => r.json())
          .then((j: any) => j.ipv4);
      } catch (e) {}
      if (parts[1] !== undefined) {
        // Operator code
        operators = parts[1].toUpperCase().trim().split(",");
        cleanIPs = cleanIPs.filter((el: any) =>
          operators.includes(el.operator)
        );
      }

      // Get maximum number of configs from the link
      if (url.searchParams.has("max")) {
        maxConfigsPerOperator = parseInt(url.searchParams.get("max") as string);
        if (!maxConfigsPerOperator) {
          maxConfigsPerOperator = MAX_CONFIGS_PER_OPERATOR;
        }
      }

      // Include the original config in the list of configs
      if (url.searchParams.has("original")) {
        const original = url.searchParams.get("original") as string;
        includeOriginalConfigs = ["1", "true", "yes", "y"].includes(
          original.toLowerCase()
        );
      }

      if (includeOriginalConfigs && url.searchParams.has("merge")) {
        const merge = url.searchParams.get("merge") as string;
        onlyOriginalConfigs = !["1", "true", "yes", "y"].includes(
          merge.toLowerCase()
        );
      }

      if (url.searchParams.has("fp")) {
        fpList = [
          (url.searchParams.get("fp") as string).toLocaleLowerCase().trim(),
        ];
      }

      if (url.searchParams.has("alpn")) {
        alpnList = [
          (url.searchParams.get("alpn") as string).toLocaleLowerCase().trim(),
        ];
      }

      // only get specific types of configs
      if (url.searchParams.has("type")) {
        selectedTypes = (url.searchParams.get("type") as string)
          .toLocaleLowerCase()
          .split(",")
          .map((s: string) => s.trim());
      }

      var configList: Array<any> = [];
      var acceptableConfigList: Array<any> = [];
      var ircfConfigList: Array<any> = [];
      var finalConfigList: Array<any> = [];
      var newConfigs: any;

      for (const sub of configProviders) {
        try {
          newConfigs = sub.configs;
          newConfigs = newConfigs.join("\n").split("\n");
          if (!onlyOriginalConfigs) {
            acceptableConfigList.push({
              name: sub.name,
              configs: newConfigs.filter((cnf: any) =>
                cnf.match(/^(vmess|vless|trojan):\/\//i)
              ),
              mergedConfigs: null,
            });
            ircfConfigList.push({
              name: sub.name,
              configs: newConfigs.filter((cnf: any) =>
                cnf.match(/^(vmess|vless|trojan):\/\//i)
              ),
              mergedConfigs: null,
            });
          }
          if (includeOriginalConfigs) {
            configList.push({
              name: sub.name,
              configs: newConfigs.filter((cnf: any) =>
                cnf.match(new RegExp(`(${selectedTypes.join("|")})`, "i"))
              ),
              renamedConfigs: null,
            });
          }
        } catch (e) {}
      }

      if (includeOriginalConfigs) {
        for (const i in configList) {
          const el = configList[i];
          configList[i].renamedConfigs = el.configs
            .map(decodeConfig)
            .map((cnf: any) => renameConfig(cnf, el.name))
            .filter((cnf: any) => !!cnf && cnf.id)
            .map(encodeConfig)
            .filter((cnf: any) => !!cnf);
        }
        for (const el of configList) {
          // add the renamed original configs to the final config list
          finalConfigList = finalConfigList.concat(el.renamedConfigs);
        }
      }

      for (const i in ircfConfigList) {
        const el = ircfConfigList[i];
        ircfConfigList[i].mergedConfigs = [];
        for (const operator of ircfCleanIP) {
          for (ip of operator.ipLinks) {
            const ipConfig = el.configs
              .map(decodeConfig)
              .map((cnf: any) =>
                mixConfig(cnf, url, ip, operator.operatorName, el.name)
              )
              .filter((cnf: any) => !!cnf && cnf.id)
              .map(encodeConfig)
              .filter((cnf: any) => !!cnf);
            ircfConfigList[i].mergedConfigs.push(...ipConfig);
          }
        }
      }

      for (const el of ircfConfigList) {
        // add the configs that have clean ips to the final config list
        finalConfigList = finalConfigList.concat(el.mergedConfigs);
      }

      if (!cleanIPs.length) {
        operators = ["General"];
        cleanIPs = [{ ip: "", operator: "General" }];
      }
      for (const i in acceptableConfigList) {
        const el = acceptableConfigList[i];
        acceptableConfigList[i].mergedConfigs = [];
        for (const operator of operators) {
          var ipList = getMultipleRandomElements(
            cleanIPs.filter((el) => el.operator == operator),
            maxConfigsPerOperator
          );
          for (const ipString of ipList) {
            var ip = ipString.ip;
            const ipConfig = el.configs
              .map(decodeConfig)
              .map((cnf: any) => mixConfig(cnf, url, ip, operator, el.name))
              .filter((cnf: any) => !!cnf && cnf.id)
              .map(encodeConfig)
              .filter((cnf: any) => !!cnf);
            acceptableConfigList[i].mergedConfigs.push(...ipConfig);
          }
        }
      }

      for (const el of acceptableConfigList) {
        // add the configs that have clean ips to the final config list
        finalConfigList = finalConfigList.concat(el.mergedConfigs);
      }

      return new Response(
        Buffer.from(finalConfigList.join("\n"), "utf-8").toString("base64")
      );
    } else if (path) {
      const addrPath = url.pathname.replace(/^\/|\/$/g, "");
      const newUrl = new URL("https://" + addrPath);
      return fetch(new Request(newUrl, request));
    } else {
      return new Response(
        `\
<!DOCTYPE html>
<body dir="auto">
  <h3><font color="green">همه چی درسته</font></h3>
    <p />
    <p>می‌توانید با متغیر max تعداد کانفیگ را مشخص کنید:</p>
    <p>
      <a href="https://${url.hostname}/sub?max=200"
        >https://${url.hostname}/sub?max=200</a
      >
    </p>
    <p>
      همچنین می‌توانید با متغیر original با عدد 0 یا 1 و یا با yes/no مشخص کنید
      که کانفیگ‌های اصلی (ترکیب نشده با ورکر) هم در خروجی آورده شوند یا نه:
    </p>
    <p>
      <a href="https://${url.hostname}/sub/1.2.3.4?max=200&original=yes"
        >https://${url.hostname}/sub/1.2.3.4?max=200&original=yes</a
      >
    </p>
    <p>
      <a href="https://${url.hostname}/sub?max=200&original=0"
        >https://${url.hostname}/sub?max=200&original=0</a
      >
    </p>
    <p>
      در صورت لزوم می توانید با متغیر merge مشخص کنید که کانفیگ‌های ترکیبی حذف
      شوند:
    </p>
    <p>
      <a href="https://${url.hostname}/sub?max=200&original=yes&merge=no"
        >https://${url.hostname}/sub?max=200&original=yes&merge=no</a
      >
    </p>
    <p>همچنین می‌توانید fp و alpn را نیز مشخص کنید:</p>
    <p>
      <a href="https://${url.hostname}/sub?max=200&fp=chrome&alpn=h2,http/1.1"
        >https://${url.hostname}/sub?max=200&fp=chrome&alpn=h2,http/1.1</a
      >
    </p>
    <p>
      در صورت نیاز می‌توانید برای کانفیگ‌های اصلی، تعیین کنید که کدام نوع از
      کانفیگ‌ها را برای شما لیست کند:
    </p>
    <p>
      <a href="https://${url.hostname}/sub?max=200&type=vmess,ss,ssr,vless"
        >https://${url.hostname}/sub?max=200&type=vmess,ss,ssr,vless</a
      >
    </p>
</body>`,
        {
          headers: {
            "content-type": "text/html;charset=UTF-8",
          },
        }
      );
    }
  },
};

function encodeConfig(conf: any): string | null {
  var configStr: string | null = null;

  try {
    if (conf.protocol === "vmess") {
      delete conf.protocol;
      configStr =
        "vmess://" +
        Buffer.from(JSON.stringify(conf), "utf-8").toString("base64");
    } else if (["vless", "trojan"].includes(conf?.protocol)) {
      configStr = `${conf.protocol}://${conf.id}@${conf.add}:${
        conf.port
      }?security=${conf.tls}&type=${conf.net}&path=${encodeURIComponent(
        conf.path
      )}&host=${encodeURIComponent(conf.host)}&tls=${conf.tls}&sni=${
        conf.sni
      }#${encodeURIComponent(conf.ps)}`;
    }
  } catch (e) {
    // console.log(`Failed to encode ${JSON.stringify(conf)}`, e);
  }

  return configStr;
}

function decodeConfig(configStr: string): any {
  var match: any = null;
  var conf: any = null;
  if (configStr.startsWith("vmess://")) {
    try {
      conf = JSON.parse(
        Buffer.from(configStr.substring(8), "base64").toString("utf-8")
      );
      conf.protocol = "vmess";
    } catch (e) {}
  } else if (
    (match = configStr.match(
      /^(?<protocol>trojan|vless):\/\/(?<id>.*)@(?<add>.*):(?<port>\d+)\??(?<options>.*)#(?<ps>.*)$/
    ))
  ) {
    try {
      const optionsArr = match.groups.options.split("&") ?? [];
      const optionsObj = optionsArr.reduce(
        (obj: Record<string, string>, option: string) => {
          const [key, value] = option.split("=");
          obj[key] = decodeURIComponent(value);
          return obj;
        },
        {} as Record<string, string>
      );

      conf = {
        protocol: match.groups.protocol,
        id: match.groups.id,
        add: match.groups?.add,
        port: match.groups.port ?? 443,
        ps: match.groups?.ps,
        net: optionsObj.type ?? optionsObj.net ?? "tcp",
        host: optionsObj?.host,
        path: optionsObj?.path,
        tls: optionsObj.security ?? "none",
        sni: optionsObj?.sni,
        alpn: optionsObj?.alpn,
      };
    } catch (e) {
      // console.log(`Failed to decode ${configStr}`, e)
    }
  }
  return conf;
}

function mixConfig(
  conf: any,
  url: URL,
  ip: string,
  operator: string,
  provider: string
) {
  try {
    if (conf.tls != "tls" || conf.net == "tcp") {
      // console.log(`notls ${JSON.stringify(conf)}`)
      return {};
    }

    var addr = conf.sni;
    if (!addr) {
      if (conf.host && !isIp(conf.host)) {
        addr = conf.host;
      } else if (conf.add && !isIp(conf.add)) {
        addr = conf.add;
      }
    }
    if (!addr) {
      // console.log(`noaddress ${JSON.stringify(conf)}`)
      return {};
    }

    if (addr.endsWith(".workers.dev")) {
      // Already merged with worker
      const part1 = conf.path.split("/").pop();
      const part2 = conf.path.substring(0, conf.path.length - part1.length - 1);
      var path;
      if (part1.includes(":")) {
        addr = part1.replace(/^\//g, "").split(":");
        conf.port = parseInt(addr[1]);
        addr = addr[0];
        path = "/" + part2.replace(/^\//g, "");
      } else if (part2.includes(":")) {
        addr = part2.replace(/^\//g, "").split(":");
        conf.port = parseInt(addr[1]);
        addr = addr[0];
        path = "/" + part1.replace(/^\//g, "");
      } else if (part1.includes(".")) {
        addr = part1.replace(/^\//g, "");
        conf.port = 443;
        path = "/" + part2.replace(/^\//g, "");
      } else {
        addr = part2.replace(/^\//g, "");
        conf.port = 443;
        path = "/" + part1.replace(/^\//g, "");
      }
      conf.path = path;
    }

    conf.ps = conf?.ps ? conf.ps : conf.name;
    if (provider) {
      conf.ps = provider + "-" + conf.ps;
    }

    conf.ps = conf.ps + "-W-" + operator.toLocaleLowerCase();
    conf.name = conf.ps;
    conf.host = url.hostname;
    conf.sni = url.hostname;
    if (ip) {
      conf.add = ip;
    } else {
      conf.add = domainList[Math.floor(Math.random() * domainList.length)];
    }

    // conf.path = "/" + addr + ":" + conf.port + (conf?.path ? "/" + conf.path.replace(/^\//g, "") : "")
    conf.path =
      "/" + addr + (conf?.path ? "/" + conf.path.replace(/^\//g, "") : "");
    conf.alpn = alpnList[Math.floor(Math.random() * alpnList.length)];
    conf.fp = fpList[Math.floor(Math.random() * fpList.length)];
    conf.utls = conf.fp;
    // conf.port = 443
    return conf;
  } catch (e) {
    // console.log(`Failed to merge config ${JSON.stringify(conf)}`, e)
    return {};
  }
}

function renameConfig(conf: any, provider: string) {
  try {
    conf.ps = conf?.ps ? conf.ps : conf.name;
    conf.ps = provider + "-" + conf.ps;
    return conf;
  } catch (e) {
    // console.log(`Failed to rename config ${JSON.stringify(conf)}`, e)
    return {};
  }
}

// Get multiple configs and randomly sort them
function getMultipleRandomElements(arr: Array<any>, num: number) {
  var shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, num);
}

function isIp(str: string) {
  try {
    if (str == "" || str == undefined) return false;
    if (
      !/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])(\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])){2}\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-4])$/.test(
        str
      )
    ) {
      return false;
    }
    var ls = str.split(".");
    if (ls == null || ls.length != 4 || ls[3] == "0" || parseInt(ls[3]) === 0) {
      return false;
    }
    return true;
  } catch (e) {}
  return false;
}
