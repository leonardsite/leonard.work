(function () {
    const root = window.KIDSPEDIA_DATA;
    if (!root || !Array.isArray(root.modules)) return;

    const extra = {
        dinosaurs: {
            semantic: {
                "羽毛恐龙": ["始祖鸟", "羽毛", "演化"],
                "长脖子": ["梁龙", "腕龙", "植食巨型"]
            },
            relations: [
                ["allosaurus", "stegosaurus", "捕食"],
                ["diplodocus", "brachiosaurus", "同为长颈植食者"],
                ["archaeopteryx", "pteranodon", "飞行演化线索"],
                ["carnotaurus", "trex", "不同大陆猎手"],
                ["iguanodon", "triceratops", "植食者比较"]
            ],
            items: [
                { id: "allosaurus", zh: "异特龙", en: "Allosaurus", wiki: "Allosaurus", type: "肉食恐龙", summary: "侏罗纪晚期常见大型掠食者。", period: "侏罗纪晚期", year: -150000000, region: "北美", lat: 39.1, lng: -109.5, tags: ["捕食", "大型", "侏罗纪"] },
                { id: "diplodocus", zh: "梁龙", en: "Diplodocus", wiki: "Diplodocus", type: "植食恐龙", summary: "尾巴很长，常被认为是巨型长颈恐龙代表。", period: "侏罗纪晚期", year: -154000000, region: "北美", lat: 40.2, lng: -105.7, tags: ["长颈", "巨型", "植食"] },
                { id: "iguanodon", zh: "禽龙", en: "Iguanodon", wiki: "Iguanodon", type: "植食恐龙", summary: "拇指尖刺可能用于防御和取食。", period: "白垩纪早期", year: -125000000, region: "欧洲", lat: 50.8, lng: 4.4, tags: ["植食", "拇指刺", "群居"] },
                { id: "carnotaurus", zh: "食肉牛龙", en: "Carnotaurus", wiki: "Carnotaurus", type: "肉食恐龙", summary: "头部有角，后肢发达，行动敏捷。", period: "白垩纪晚期", year: -72000000, region: "南美", lat: -45.0, lng: -68.0, tags: ["有角", "捕食", "南美"] },
                { id: "archaeopteryx", zh: "始祖鸟", en: "Archaeopteryx", wiki: "Archaeopteryx", type: "过渡化石", summary: "兼具恐龙与鸟类特征的重要化石。", period: "侏罗纪晚期", year: -150800000, region: "欧洲", lat: 49.0, lng: 11.0, tags: ["羽毛", "演化", "飞行"] }
            ]
        },
        insects: {
            semantic: {
                "害虫": ["蚊子", "白蚁", "农作物"],
                "夜间活动": ["飞蛾", "蚊子", "萤火虫"]
            },
            relations: [
                ["mosquito", "dragonfly", "被捕食关系"],
                ["termite", "ant", "社会性昆虫比较"],
                ["moth", "butterfly", "同属鳞翅目"],
                ["wasp", "bee", "膜翅目近缘"],
                ["grasshopper", "mantis", "捕食关系"]
            ],
            items: [
                { id: "mosquito", zh: "蚊子", en: "Mosquito", wiki: "Mosquito", type: "双翅目", summary: "吸食体液，部分种类会传播疾病。", period: "现代", year: 0, region: "全球暖区", lat: 14.6, lng: 121.0, tags: ["夜间", "叮咬", "防蚊"] },
                { id: "grasshopper", zh: "蚱蜢", en: "Grasshopper", wiki: "Grasshopper", type: "直翅目", summary: "后足发达，善于跳跃。", period: "现代", year: 0, region: "草地与农田", lat: 34.3, lng: 108.9, tags: ["跳跃", "草食", "农田"] },
                { id: "termite", zh: "白蚁", en: "Termite", wiki: "Termite", type: "蜚蠊目", summary: "群体生活，能够分解木质纤维。", period: "现代", year: 0, region: "热带与亚热带", lat: 1.3, lng: 103.8, tags: ["群居", "木材", "分解者"] },
                { id: "moth", zh: "飞蛾", en: "Moth", wiki: "Moth", type: "鳞翅目", summary: "多在夜间活动，趋光性明显。", period: "现代", year: 0, region: "全球", lat: 35.7, lng: 139.7, tags: ["夜间", "趋光", "鳞翅目"] },
                { id: "wasp", zh: "黄蜂", en: "Wasp", wiki: "Wasp", type: "膜翅目", summary: "部分种类具有攻击性和防御性刺针。", period: "现代", year: 0, region: "全球", lat: 51.5, lng: -0.1, tags: ["刺针", "巢穴", "捕食"] }
            ]
        },
        marine: {
            semantic: {
                "极地海洋": ["独角鲸", "虎鲸", "磷虾"],
                "群体捕食": ["虎鲸", "海狮", "协作"]
            },
            relations: [
                ["orca", "sea_lion", "捕食关系"],
                ["narwhal", "orca", "极地海洋哺乳动物"],
                ["squid", "dolphin", "猎物关系"],
                ["krill", "blue_whale", "食物来源"],
                ["sea_lion", "shark", "竞争与被捕食"]
            ],
            items: [
                { id: "orca", zh: "虎鲸", en: "Orca", wiki: "Orca", type: "哺乳动物", summary: "高度社会化的海洋顶级捕食者。", period: "现代", year: 0, region: "全球海洋", lat: 64.1, lng: -21.9, tags: ["群体", "顶级捕食者", "聪明"] },
                { id: "sea_lion", zh: "海狮", en: "Sea Lion", wiki: "Sea_lion", type: "哺乳动物", summary: "善于游泳和潜水，常见于沿海岩岸。", period: "现代", year: 0, region: "温带海岸", lat: 36.6, lng: -121.9, tags: ["鳍脚类", "群居", "海岸"] },
                { id: "narwhal", zh: "独角鲸", en: "Narwhal", wiki: "Narwhal", type: "哺乳动物", summary: "生活在北极海域，雄性常有长牙。", period: "现代", year: 0, region: "北极海域", lat: 74.0, lng: -56.0, tags: ["北极", "长牙", "鲸类"] },
                { id: "squid", zh: "鱿鱼", en: "Squid", wiki: "Squid", type: "软体动物", summary: "喷射推进游动，反应敏捷。", period: "现代", year: 0, region: "全球海洋", lat: 35.0, lng: 139.0, tags: ["喷射推进", "触腕", "夜间"] },
                { id: "krill", zh: "磷虾", en: "Krill", wiki: "Krill", type: "甲壳动物", summary: "体型虽小，却是南极食物网关键成员。", period: "现代", year: 0, region: "南大洋", lat: -64.0, lng: -56.0, tags: ["浮游生物", "食物网", "南极"] }
            ]
        },
        space: {
            semantic: {
                "深空探测": ["旅行者1号", "哈勃", "外太阳系"],
                "外行星": ["天王星", "海王星", "冥王星"]
            },
            relations: [
                ["uranus", "neptune", "冰巨行星"],
                ["pluto", "neptune", "柯伊伯带附近"],
                ["hubble", "iss", "近地轨道设施"],
                ["voyager1", "jupiter", "飞掠探测"],
                ["voyager1", "saturn", "飞掠探测"]
            ],
            items: [
                { id: "uranus", zh: "天王星", en: "Uranus", wiki: "Uranus", type: "行星", summary: "自转轴倾角很大，像“侧着转”。", period: "古代已知", year: 1781, region: "太阳系", lat: null, lng: null, tags: ["冰巨星", "低温", "环系"] },
                { id: "neptune", zh: "海王星", en: "Neptune", wiki: "Neptune", type: "行星", summary: "风速极高的蓝色外行星。", period: "近代发现", year: 1846, region: "太阳系", lat: null, lng: null, tags: ["外行星", "强风", "蓝色"] },
                { id: "pluto", zh: "冥王星", en: "Pluto", wiki: "Pluto", type: "矮行星", summary: "位于柯伊伯带，轨道偏心率较大。", period: "近代发现", year: 1930, region: "柯伊伯带", lat: null, lng: null, tags: ["矮行星", "远日", "冰岩"] },
                { id: "hubble", zh: "哈勃望远镜", en: "Hubble Space Telescope", wiki: "Hubble_Space_Telescope", type: "空间望远镜", summary: "提供了大量高分辨率宇宙图像。", period: "现代航天", year: 1990, region: "近地轨道", lat: 28.5, lng: -80.6, tags: ["望远镜", "观测", "宇宙"] },
                { id: "voyager1", zh: "旅行者1号", en: "Voyager 1", wiki: "Voyager_1", type: "深空探测器", summary: "已飞出日球层，持续回传深空数据。", period: "现代航天", year: 1977, region: "星际空间", lat: null, lng: null, tags: ["探测器", "深空", "里程碑"] }
            ]
        },
        vehicles: {
            semantic: {
                "城市轨道": ["地铁", "有轨电车", "通勤"],
                "两轮交通": ["摩托车", "自行车", "短途"]
            },
            relations: [
                ["metro", "tram", "城市轨道交通"],
                ["motorcycle", "bicycle", "两轮交通工具"],
                ["ferry", "ship", "水上客运"],
                ["cablecar", "tram", "轨道牵引交通"],
                ["metro", "bus", "公共出行互补"]
            ],
            items: [
                { id: "metro", zh: "地铁", en: "Metro", wiki: "Rapid_transit", type: "轨道交通", summary: "大运量城市公共交通系统。", period: "现代", year: 1863, region: "城市", lat: 51.5, lng: -0.1, tags: ["通勤", "地下", "高频"] },
                { id: "tram", zh: "有轨电车", en: "Tram", wiki: "Tram", type: "轨道交通", summary: "多在城市道路中运行，停靠站点密集。", period: "现代", year: 1881, region: "城市", lat: 48.2, lng: 16.4, tags: ["电力", "轨道", "城市"] },
                { id: "motorcycle", zh: "摩托车", en: "Motorcycle", wiki: "Motorcycle", type: "道路交通", summary: "机动灵活，适合个人中短途出行。", period: "现代", year: 1885, region: "全球", lat: 50.1, lng: 8.6, tags: ["两轮", "灵活", "速度"] },
                { id: "ferry", zh: "渡轮", en: "Ferry", wiki: "Ferry", type: "水路交通", summary: "用于跨江跨海短程客货运。", period: "现代", year: 1850, region: "沿海与河口", lat: 22.3, lng: 114.2, tags: ["摆渡", "客运", "水路"] },
                { id: "cablecar", zh: "缆车", en: "Cable Car", wiki: "Cable_car", type: "山地交通", summary: "通过钢缆牵引，常用于山地和景区。", period: "现代", year: 1873, region: "山地城市", lat: 37.8, lng: -122.4, tags: ["牵引", "景区", "山地"] }
            ]
        },
        construction: {
            semantic: {
                "铺路": ["摊铺机", "压路机", "道路施工"],
                "场地整平": ["平地机", "推土机", "土方"]
            },
            relations: [
                ["grader", "roller", "整平与压实"],
                ["paver", "roller", "铺路协作"],
                ["skidsteer", "excavator", "小型工地协作"],
                ["mobilecrane", "crane", "吊装家族"],
                ["drillingrig", "tbm", "地下工程相关"]
            ],
            items: [
                { id: "grader", zh: "平地机", en: "Motor Grader", wiki: "Grader", type: "道路设备", summary: "用于场地找平和路基精整。", period: "现代", year: 1920, region: "道路工地", lat: 35.7, lng: 139.7, tags: ["找平", "路基", "施工"] },
                { id: "paver", zh: "摊铺机", en: "Paver", wiki: "Paver_(vehicle)", type: "道路设备", summary: "将沥青均匀铺设在路面上。", period: "现代", year: 1931, region: "道路工地", lat: 40.0, lng: 116.4, tags: ["沥青", "铺路", "道路"] },
                { id: "skidsteer", zh: "滑移装载机", en: "Skid-steer Loader", wiki: "Skid-steer_loader", type: "多功能设备", summary: "机身小巧，适合狭窄工地作业。", period: "现代", year: 1957, region: "工地", lat: 46.9, lng: -96.8, tags: ["灵活", "装载", "小型"] },
                { id: "drillingrig", zh: "钻机", en: "Drilling Rig", wiki: "Drilling_rig", type: "基础设备", summary: "用于地基桩孔、勘探或取样。", period: "现代", year: 1901, region: "基础工程", lat: 29.8, lng: -95.4, tags: ["钻孔", "勘探", "地基"] },
                { id: "mobilecrane", zh: "汽车起重机", en: "Mobile Crane", wiki: "Crane_(machine)", type: "吊装设备", summary: "机动性强，适合多点位吊装作业。", period: "现代", year: 1910, region: "工地与港口", lat: 52.0, lng: 4.3, tags: ["机动", "吊装", "重物"] }
            ]
        },
        humanbody: {
            semantic: {
                "消化吸收": ["肠道", "胰腺", "营养"],
                "听觉": ["耳朵", "平衡", "声音"]
            },
            relations: [
                ["blood", "heart", "循环运输"],
                ["intestine", "stomach", "消化接续"],
                ["pancreas", "liver", "代谢协同"],
                ["ears", "brain", "听觉处理"],
                ["teeth", "stomach", "消化起点"]
            ],
            items: [
                { id: "blood", zh: "血液", en: "Blood", wiki: "Blood", type: "循环系统", summary: "运输氧气、营养和代谢产物。", period: "生命科学", year: 1628, region: "人体", lat: null, lng: null, tags: ["运输", "红细胞", "循环"] },
                { id: "intestine", zh: "肠道", en: "Intestine", wiki: "Intestine", type: "消化系统", summary: "负责进一步消化与营养吸收。", period: "生命科学", year: 1700, region: "人体", lat: null, lng: null, tags: ["吸收", "消化", "菌群"] },
                { id: "pancreas", zh: "胰腺", en: "Pancreas", wiki: "Pancreas", type: "内分泌系统", summary: "分泌胰液和激素，参与血糖调节。", period: "生命科学", year: 1869, region: "人体", lat: null, lng: null, tags: ["胰岛素", "消化酶", "代谢"] },
                { id: "ears", zh: "耳朵", en: "Ears", wiki: "Ear", type: "感官系统", summary: "感知声音并帮助身体保持平衡。", period: "生命科学", year: 1600, region: "人体", lat: null, lng: null, tags: ["听觉", "平衡", "感官"] },
                { id: "teeth", zh: "牙齿", en: "Teeth", wiki: "Tooth", type: "消化系统", summary: "咀嚼食物，是消化过程的第一步。", period: "生命科学", year: 0, region: "人体", lat: null, lng: null, tags: ["咀嚼", "口腔", "健康"] }
            ]
        },
        weather: {
            semantic: {
                "高温": ["热浪", "防暑", "中暑"],
                "寒冷": ["寒潮", "雨夹雪", "结冰"]
            },
            relations: [
                ["sleet", "snow", "低温降水"],
                ["heatwave", "sunny", "持续高温"],
                ["coldwave", "snow", "冷空气影响"],
                ["monsoon", "rain", "季节性降雨"],
                ["aurora", "sunny", "太阳活动关联"]
            ],
            items: [
                { id: "sleet", zh: "雨夹雪", en: "Sleet", wiki: "Sleet", type: "降水天气", summary: "雨滴和雪花同时出现的混合降水。", period: "冬春季", year: 0, region: "温带地区", lat: 39.9, lng: 116.4, tags: ["低温", "湿滑", "交通影响"] },
                { id: "heatwave", zh: "热浪", en: "Heat Wave", wiki: "Heat_wave", type: "极端天气", summary: "连续高温天气，容易造成中暑风险。", period: "夏季", year: 0, region: "全球", lat: 41.9, lng: 12.5, tags: ["高温", "防暑", "健康"] },
                { id: "coldwave", zh: "寒潮", en: "Cold Wave", wiki: "Cold_wave", type: "极端天气", summary: "强冷空气入侵，气温短时骤降。", period: "冬季", year: 0, region: "中高纬", lat: 55.7, lng: 37.6, tags: ["降温", "大风", "防寒"] },
                { id: "monsoon", zh: "季风", en: "Monsoon", wiki: "Monsoon", type: "季节环流", summary: "随季节改变风向，影响降雨分布。", period: "季节性", year: 0, region: "南亚与东亚", lat: 19.1, lng: 72.9, tags: ["风向", "降雨", "季节"] },
                { id: "aurora", zh: "极光", en: "Aurora", wiki: "Aurora", type: "大气光学", summary: "高纬地区天空中的彩色光带现象。", period: "夜间观测", year: 0, region: "极地地区", lat: 69.6, lng: 18.9, tags: ["极地", "光带", "太阳风"] }
            ]
        },
        plants: {
            semantic: {
                "经济作物": ["玉米", "茶树", "葡萄"],
                "生态保护": ["红树林", "湿地", "海岸"]
            },
            relations: [
                ["corn", "rice", "主粮作物"],
                ["tea", "rose", "园艺与栽培"],
                ["grape", "apple", "果树与果藤"],
                ["maple", "oak", "温带林木"],
                ["mangrove", "lotus", "湿地生态"]
            ],
            items: [
                { id: "corn", zh: "玉米", en: "Corn", wiki: "Maize", type: "粮食作物", summary: "用途广泛，可作主食和饲料。", period: "农业", year: -7000, region: "美洲起源", lat: 19.4, lng: -99.1, tags: ["主粮", "高产", "饲料"] },
                { id: "tea", zh: "茶树", en: "Tea Plant", wiki: "Camellia_sinensis", type: "经济作物", summary: "嫩叶可制成绿茶、红茶等饮品。", period: "农业", year: -1000, region: "东亚", lat: 27.9, lng: 120.7, tags: ["饮品", "园艺", "经济作物"] },
                { id: "grape", zh: "葡萄藤", en: "Grape Vine", wiki: "Vitis_vinifera", type: "果树", summary: "果实可鲜食，也可加工成果汁。", period: "农业", year: -6000, region: "地中海", lat: 43.3, lng: 5.4, tags: ["果实", "藤本", "栽培"] },
                { id: "maple", zh: "枫树", en: "Maple", wiki: "Maple", type: "乔木", summary: "秋季叶色变化明显，观赏价值高。", period: "森林生态", year: 0, region: "北半球", lat: 45.4, lng: -75.7, tags: ["秋叶", "温带", "林木"] },
                { id: "mangrove", zh: "红树林", en: "Mangrove", wiki: "Mangrove", type: "湿地植物", summary: "能抵御海浪侵蚀，保护海岸生态。", period: "生态系统", year: 0, region: "热带海岸", lat: 22.2, lng: 113.5, tags: ["海岸", "防护", "湿地"] }
            ]
        },
        countries: {
            semantic: {
                "欧洲国家": ["英国", "德国", "法国"],
                "英联邦": ["英国", "加拿大", "新西兰"]
            },
            relations: [
                ["uk", "france", "欧洲邻国"],
                ["germany", "france", "欧盟核心国家"],
                ["mexico", "usa", "北美邻国"],
                ["south_africa", "kenya", "非洲国家"],
                ["new_zealand", "australia", "大洋洲邻近国家"]
            ],
            items: [
                { id: "uk", zh: "英国", en: "United Kingdom", wiki: "United_Kingdom", type: "欧洲", summary: "由英格兰、苏格兰、威尔士和北爱尔兰组成。", period: "现代国家", year: 1707, region: "西欧", lat: 51.5, lng: -0.1, tags: ["岛国", "英语", "历史"] },
                { id: "germany", zh: "德国", en: "Germany", wiki: "Germany", type: "欧洲", summary: "工业和制造业发达，教育体系完善。", period: "现代国家", year: 1871, region: "中欧", lat: 52.5, lng: 13.4, tags: ["工业", "欧洲", "科技"] },
                { id: "mexico", zh: "墨西哥", en: "Mexico", wiki: "Mexico", type: "北美", summary: "拥有丰富的古文明遗址和自然景观。", period: "现代国家", year: 1821, region: "北美", lat: 19.4, lng: -99.1, tags: ["古文明", "美食", "北美"] },
                { id: "south_africa", zh: "南非", en: "South Africa", wiki: "South_Africa", type: "非洲", summary: "生物多样性丰富，拥有多种生态区。", period: "现代国家", year: 1910, region: "南非洲", lat: -25.7, lng: 28.2, tags: ["非洲", "草原", "海岸"] },
                { id: "new_zealand", zh: "新西兰", en: "New Zealand", wiki: "New_Zealand", type: "大洋洲", summary: "自然环境优美，以火山和冰川地貌闻名。", period: "现代国家", year: 1907, region: "大洋洲", lat: -41.3, lng: 174.8, tags: ["岛国", "自然", "南半球"] }
            ]
        },
        jobs: {
            semantic: {
                "数字职业": ["程序员", "工程师", "科学家"],
                "动物医疗": ["兽医", "医生", "护理"]
            },
            relations: [
                ["programmer", "engineer", "技术协作"],
                ["veterinarian", "doctor", "医疗职业比较"],
                ["architect", "engineer", "建筑项目协作"],
                ["astronaut", "pilot", "航空航天路径"],
                ["journalist", "teacher", "知识传播"]
            ],
            items: [
                { id: "programmer", zh: "程序员", en: "Programmer", wiki: "Programmer", type: "技术", summary: "编写软件和应用，解决实际问题。", period: "现代职业", year: 0, region: "科技公司", lat: 37.8, lng: -122.4, tags: ["编程", "软件", "逻辑"] },
                { id: "veterinarian", zh: "兽医", en: "Veterinarian", wiki: "Veterinarian", type: "医疗", summary: "为动物诊疗和预防疾病。", period: "现代职业", year: 0, region: "宠物医院", lat: 35.7, lng: 139.7, tags: ["动物", "医疗", "关爱"] },
                { id: "architect", zh: "建筑师", en: "Architect", wiki: "Architect", type: "设计", summary: "负责建筑空间和结构方案设计。", period: "现代职业", year: 0, region: "设计院", lat: 48.8, lng: 2.3, tags: ["建筑", "设计", "创意"] },
                { id: "astronaut", zh: "宇航员", en: "Astronaut", wiki: "Astronaut", type: "航天", summary: "执行空间站任务和科学实验。", period: "现代职业", year: 0, region: "航天中心", lat: 29.6, lng: -95.1, tags: ["太空", "训练", "探索"] },
                { id: "journalist", zh: "记者", en: "Journalist", wiki: "Journalist", type: "传媒", summary: "采访报道事实，传递公共信息。", period: "现代职业", year: 0, region: "新闻机构", lat: 40.7, lng: -74.0, tags: ["采访", "报道", "传播"] }
            ]
        },
        festivals: {
            semantic: {
                "春季节庆": ["元宵节", "花见", "洒红节"],
                "环保主题": ["地球日", "绿色", "行动"]
            },
            relations: [
                ["lanternfestival", "springfest", "春节系列节庆"],
                ["holi", "diwali", "南亚文化节日"],
                ["oktoberfest", "carnival", "大型民俗庆典"],
                ["hanami", "springfest", "春季赏花与团聚"],
                ["earthday", "thanksgiving", "社会倡议与感恩"]
            ],
            items: [
                { id: "lanternfestival", zh: "元宵节", en: "Lantern Festival", wiki: "Lantern_Festival", type: "东亚节日", summary: "农历正月十五，常有花灯和汤圆。", period: "传统节日", year: -1000, region: "中国", lat: 32.1, lng: 118.8, tags: ["花灯", "汤圆", "团圆"] },
                { id: "holi", zh: "洒红节", en: "Holi", wiki: "Holi", type: "南亚节日", summary: "以彩粉庆祝春天与友谊。", period: "传统节日", year: -300, region: "印度", lat: 28.6, lng: 77.2, tags: ["彩粉", "春天", "欢乐"] },
                { id: "oktoberfest", zh: "啤酒节", en: "Oktoberfest", wiki: "Oktoberfest", type: "欧洲节日", summary: "大型民俗庆典，包含音乐与游乐活动。", period: "现代节庆", year: 1810, region: "德国", lat: 48.1, lng: 11.5, tags: ["巡游", "民俗", "音乐"] },
                { id: "hanami", zh: "花见", en: "Hanami", wiki: "Hanami", type: "东亚节日", summary: "在樱花季外出赏花、亲友相聚。", period: "传统习俗", year: 0, region: "日本", lat: 35.7, lng: 139.7, tags: ["樱花", "春季", "赏花"] },
                { id: "earthday", zh: "地球日", en: "Earth Day", wiki: "Earth_Day", type: "全球节日", summary: "倡导环保行动和可持续生活方式。", period: "现代节庆", year: 1970, region: "全球", lat: 38.9, lng: -77.0, tags: ["环保", "气候", "行动"] }
            ]
        }
    };

    root.modules.forEach((module) => {
        const patch = extra[module.id];
        if (!patch) return;

        if (patch.semantic && typeof patch.semantic === "object") {
            module.semantic = Object.assign({}, module.semantic || {}, patch.semantic);
        }

        if (Array.isArray(patch.relations)) {
            const current = Array.isArray(module.relations) ? module.relations : [];
            const keys = new Set(current.map((r) => `${r[0]}::${r[1]}::${r[2]}`));
            patch.relations.forEach((r) => {
                if (!Array.isArray(r) || r.length < 3) return;
                const key = `${r[0]}::${r[1]}::${r[2]}`;
                if (keys.has(key)) return;
                keys.add(key);
                current.push(r);
            });
            module.relations = current;
        }

        if (Array.isArray(patch.items)) {
            const currentItems = Array.isArray(module.items) ? module.items : [];
            const ids = new Set(currentItems.map((item) => item.id));
            patch.items.forEach((item) => {
                if (!item || !item.id || ids.has(item.id)) return;
                ids.add(item.id);
                currentItems.push(item);
            });
            module.items = currentItems;
        }
    });
})();
