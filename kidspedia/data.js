window.KIDSPEDIA_DATA = {
    modules: [
        {
            id: "dinosaurs",
            icon: "🦖",
            titleZh: "恐龙百科",
            titleEn: "Dinosaur Explorer",
            description: "认识陆地和海洋古生物，看看谁吃谁、它们生活在哪个时代。",
            semantic: {
                "大恐龙": ["霸王龙", "腕龙", "棘龙", "大型"],
                "会飞": ["翼龙", "pteranodon", "飞行"],
                "有角": ["三角龙", "角", "防御"],
                "海里": ["沧龙", "海洋", "marine"]
            },
            relations: [
                ["trex", "triceratops", "捕食"],
                ["velociraptor", "parasaurolophus", "捕食"],
                ["spinosaurus", "mosasaurus", "同为顶级猎手"],
                ["ankylosaurus", "trex", "防御对抗"],
                ["pteranodon", "velociraptor", "同一时代"]
            ],
            items: [
                { id: "trex", zh: "霸王龙", en: "T. rex", wiki: "Tyrannosaurus", type: "肉食恐龙", summary: "白垩纪晚期的大型掠食者。", period: "白垩纪晚期", year: -68000000, region: "北美", lat: 46.8, lng: -106.0, tags: ["大型", "捕食", "化石"] },
                { id: "triceratops", zh: "三角龙", en: "Triceratops", wiki: "Triceratops", type: "植食恐龙", summary: "头盾和三只角是它最明显的特征。", period: "白垩纪晚期", year: -67000000, region: "北美", lat: 47.0, lng: -103.0, tags: ["有角", "植食", "防御"] },
                { id: "velociraptor", zh: "伶盗龙", en: "Velociraptor", wiki: "Velociraptor", type: "肉食恐龙", summary: "体型不大但非常灵活，群体协作能力强。", period: "白垩纪晚期", year: -75000000, region: "蒙古", lat: 43.5, lng: 103.8, tags: ["敏捷", "群猎", "迅猛"] },
                { id: "stegosaurus", zh: "剑龙", en: "Stegosaurus", wiki: "Stegosaurus", type: "植食恐龙", summary: "背部有骨板，尾部有尖刺。", period: "侏罗纪晚期", year: -150000000, region: "北美", lat: 39.1, lng: -105.5, tags: ["背板", "尾刺", "植食"] },
                { id: "brachiosaurus", zh: "腕龙", en: "Brachiosaurus", wiki: "Brachiosaurus", type: "植食恐龙", summary: "长脖子帮助它吃到高树冠叶片。", period: "侏罗纪晚期", year: -154000000, region: "北美", lat: 39.7, lng: -104.9, tags: ["长颈", "高大", "植食"] },
                { id: "ankylosaurus", zh: "甲龙", en: "Ankylosaurus", wiki: "Ankylosaurus", type: "植食恐龙", summary: "身体覆盖骨甲，尾巴像锤子。", period: "白垩纪晚期", year: -68000000, region: "北美", lat: 49.5, lng: -112.8, tags: ["装甲", "尾锤", "防御"] },
                { id: "spinosaurus", zh: "棘龙", en: "Spinosaurus", wiki: "Spinosaurus", type: "肉食恐龙", summary: "背部巨大帆状结构，擅长半水生捕猎。", period: "白垩纪中期", year: -97000000, region: "北非", lat: 26.8, lng: 31.0, tags: ["半水生", "帆背", "捕食"] },
                { id: "parasaurolophus", zh: "副栉龙", en: "Parasaurolophus", wiki: "Parasaurolophus", type: "植食恐龙", summary: "头部长冠可能用于发声和交流。", period: "白垩纪晚期", year: -76000000, region: "北美", lat: 36.0, lng: -109.0, tags: ["长冠", "发声", "植食"] },
                { id: "pteranodon", zh: "无齿翼龙", en: "Pteranodon", wiki: "Pteranodon", type: "飞行爬行动物", summary: "并非恐龙本身，但和恐龙同时代。", period: "白垩纪晚期", year: -86000000, region: "北美", lat: 38.2, lng: -98.2, tags: ["会飞", "翼展", "海岸"] },
                { id: "mosasaurus", zh: "沧龙", en: "Mosasaurus", wiki: "Mosasaurus", type: "海洋爬行动物", summary: "白垩纪海洋中的顶级掠食者。", period: "白垩纪晚期", year: -70000000, region: "欧洲", lat: 50.9, lng: 5.7, tags: ["海洋", "掠食", "大型"] }
            ]
        },
        {
            id: "insects",
            icon: "🦋",
            titleZh: "昆虫百科",
            titleEn: "Insect Explorer",
            description: "看昆虫如何变形、传粉和协作。",
            semantic: {
                "会飞": ["蝴蝶", "蜜蜂", "蜻蜓", "飞"],
                "发光": ["萤火虫", "夜晚", "light"],
                "群体": ["蚂蚁", "蜜蜂", "合作"]
            },
            relations: [
                ["bee", "butterfly", "共同传粉"],
                ["ant", "bee", "社会性昆虫"],
                ["mantis", "dragonfly", "捕食关系"],
                ["silkworm", "butterfly", "变态发育"],
                ["firefly", "beetle", "同属甲虫类"]
            ],
            items: [
                { id: "butterfly", zh: "蝴蝶", en: "Butterfly", wiki: "Butterfly", type: "鳞翅目", summary: "从毛毛虫蜕变而来，帮助花朵传粉。", period: "现代", year: 0, region: "全球", lat: 35.0, lng: 105.0, tags: ["传粉", "彩色", "昆虫"] },
                { id: "bee", zh: "蜜蜂", en: "Honey Bee", wiki: "Western_honey_bee", type: "膜翅目", summary: "勤劳采蜜，花粉传播的重要帮手。", period: "现代", year: 0, region: "全球", lat: 47.0, lng: 8.0, tags: ["蜂巢", "传粉", "蜂蜜"] },
                { id: "ant", zh: "蚂蚁", en: "Ant", wiki: "Ant", type: "膜翅目", summary: "分工明确的群体昆虫。", period: "现代", year: 0, region: "全球", lat: 23.0, lng: 113.0, tags: ["群居", "分工", "搬运"] },
                { id: "ladybug", zh: "瓢虫", en: "Ladybug", wiki: "Coccinellidae", type: "鞘翅目", summary: "很多瓢虫会吃害虫，对农作物有益。", period: "现代", year: 0, region: "欧亚", lat: 48.8, lng: 2.3, tags: ["益虫", "斑点", "农业"] },
                { id: "dragonfly", zh: "蜻蜓", en: "Dragonfly", wiki: "Dragonfly", type: "蜻蜓目", summary: "飞行能力极强，能在空中捕食。", period: "现代", year: 0, region: "全球", lat: 31.2, lng: 121.4, tags: ["飞行", "捕食", "复眼"] },
                { id: "mantis", zh: "螳螂", en: "Praying Mantis", wiki: "Mantis", type: "螳螂目", summary: "前足像镰刀，善于伏击。", period: "现代", year: 0, region: "热带与温带", lat: 13.7, lng: 100.5, tags: ["伏击", "捕食", "伪装"] },
                { id: "firefly", zh: "萤火虫", en: "Firefly", wiki: "Firefly", type: "鞘翅目", summary: "夜晚会发光，用于求偶和交流。", period: "现代", year: 0, region: "亚洲与美洲", lat: 34.7, lng: 135.5, tags: ["发光", "夜晚", "夏天"] },
                { id: "cicada", zh: "蝉", en: "Cicada", wiki: "Cicada", type: "半翅目", summary: "夏天常听到它高频鸣叫。", period: "现代", year: 0, region: "全球暖区", lat: 30.6, lng: 114.3, tags: ["鸣叫", "夏天", "蜕壳"] },
                { id: "beetle", zh: "甲虫", en: "Beetle", wiki: "Beetle", type: "鞘翅目", summary: "昆虫中种类最多的一大类。", period: "现代", year: 0, region: "全球", lat: 52.5, lng: 13.4, tags: ["多样", "硬壳", "适应性"] },
                { id: "silkworm", zh: "蚕", en: "Silkworm", wiki: "Bombyx_mori", type: "鳞翅目", summary: "吐丝结茧，是丝绸的重要来源。", period: "现代", year: 0, region: "东亚", lat: 31.2, lng: 120.6, tags: ["丝绸", "结茧", "养殖"] }
            ]
        },
        {
            id: "marine",
            icon: "🐬",
            titleZh: "海洋生物百科",
            titleEn: "Ocean Explorer",
            description: "认识海洋里的朋友，从珊瑚礁到深海猎手。",
            semantic: {
                "鲸": ["蓝鲸", "whale", "大型"],
                "鲨鱼": ["大白鲨", "shark", "捕食"],
                "珊瑚": ["珊瑚", "reef", "热带"]
            },
            relations: [
                ["shark", "clownfish", "捕食"],
                ["octopus", "seahorse", "捕食"],
                ["dolphin", "jellyfish", "偶尔取食"],
                ["coral", "clownfish", "栖息关系"],
                ["sea_turtle", "jellyfish", "食物关系"]
            ],
            items: [
                { id: "dolphin", zh: "海豚", en: "Dolphin", wiki: "Dolphin", type: "哺乳动物", summary: "聪明、爱社交，能使用回声定位。", period: "现代", year: 0, region: "全球海域", lat: 25.8, lng: -80.1, tags: ["聪明", "群居", "声呐"] },
                { id: "blue_whale", zh: "蓝鲸", en: "Blue Whale", wiki: "Blue_whale", type: "哺乳动物", summary: "地球上已知最大的动物。", period: "现代", year: 0, region: "全球海洋", lat: 36.6, lng: -122.0, tags: ["最大", "迁徙", "滤食"] },
                { id: "clownfish", zh: "小丑鱼", en: "Clownfish", wiki: "Amphiprioninae", type: "硬骨鱼", summary: "会与海葵共生。", period: "现代", year: 0, region: "印度洋-太平洋", lat: -18.3, lng: 147.7, tags: ["共生", "珊瑚礁", "彩色"] },
                { id: "octopus", zh: "章鱼", en: "Octopus", wiki: "Octopus", type: "软体动物", summary: "高智商，善于伪装和喷墨逃生。", period: "现代", year: 0, region: "全球海洋", lat: 35.9, lng: 14.5, tags: ["伪装", "聪明", "八腕"] },
                { id: "seahorse", zh: "海马", en: "Seahorse", wiki: "Seahorse", type: "硬骨鱼", summary: "雄性海马会育幼。", period: "现代", year: 0, region: "热带海域", lat: 13.4, lng: 122.5, tags: ["育幼", "小型", "珊瑚"] },
                { id: "sea_turtle", zh: "海龟", en: "Sea Turtle", wiki: "Sea_turtle", type: "爬行动物", summary: "会长距离洄游并回到出生地附近产卵。", period: "现代", year: 0, region: "热带与亚热带", lat: 20.7, lng: -156.5, tags: ["洄游", "长寿", "海滩产卵"] },
                { id: "shark", zh: "大白鲨", en: "Great White Shark", wiki: "Great_white_shark", type: "软骨鱼", summary: "海洋中的顶级捕食者之一。", period: "现代", year: 0, region: "温带海域", lat: -34.2, lng: 18.4, tags: ["捕食", "顶级", "敏锐嗅觉"] },
                { id: "manta", zh: "蝠鲼", en: "Manta Ray", wiki: "Manta_ray", type: "软骨鱼", summary: "体型巨大但主要滤食浮游生物。", period: "现代", year: 0, region: "热带海域", lat: -8.7, lng: 115.2, tags: ["滑翔", "滤食", "温和"] },
                { id: "coral", zh: "珊瑚", en: "Coral", wiki: "Coral", type: "刺胞动物", summary: "珊瑚礁为大量海洋生物提供家园。", period: "现代", year: 0, region: "热带浅海", lat: -17.8, lng: 147.0, tags: ["礁石", "生态系统", "共生"] },
                { id: "jellyfish", zh: "水母", en: "Jellyfish", wiki: "Jellyfish", type: "刺胞动物", summary: "透明柔软，部分种类有刺细胞。", period: "现代", year: 0, region: "全球海洋", lat: 31.2, lng: -64.7, tags: ["漂浮", "触手", "刺胞"] }
            ]
        },
        {
            id: "space",
            icon: "🚀",
            titleZh: "太空百科",
            titleEn: "Space Explorer",
            description: "从太阳系到空间站，走进孩子最爱的太空主题。",
            semantic: {
                "行星": ["水星", "火星", "木星", "planet"],
                "火箭": ["火箭", "发射", "rocket"],
                "月球": ["月球", "moon", "阿波罗"]
            },
            relations: [
                ["sun", "earth", "太阳提供能量"],
                ["earth", "moon", "卫星关系"],
                ["earth", "iss", "近地轨道"],
                ["rocket", "iss", "运送补给"],
                ["jupiter", "saturn", "气态巨行星"]
            ],
            items: [
                { id: "sun", zh: "太阳", en: "Sun", wiki: "Sun", type: "恒星", summary: "太阳系中心天体，提供光和热。", period: "形成约46亿年前", year: -4600000000, region: "太阳系", lat: null, lng: null, tags: ["恒星", "能量", "中心"] },
                { id: "mercury", zh: "水星", en: "Mercury", wiki: "Mercury_(planet)", type: "行星", summary: "离太阳最近、体积最小的行星。", period: "古代已知", year: -2000, region: "太阳系", lat: null, lng: null, tags: ["最近太阳", "小型行星", "高温差"] },
                { id: "venus", zh: "金星", en: "Venus", wiki: "Venus", type: "行星", summary: "厚大气导致极强温室效应。", period: "古代已知", year: -2000, region: "太阳系", lat: null, lng: null, tags: ["明亮", "高温", "浓大气"] },
                { id: "earth", zh: "地球", en: "Earth", wiki: "Earth", type: "行星", summary: "目前已知唯一存在地表液态水和生命的行星。", period: "形成约46亿年前", year: -4540000000, region: "太阳系", lat: 0, lng: 0, tags: ["生命", "海洋", "家园"] },
                { id: "moon", zh: "月球", en: "Moon", wiki: "Moon", type: "卫星", summary: "地球唯一的天然卫星。", period: "形成约45亿年前", year: -4500000000, region: "地月系统", lat: null, lng: null, tags: ["卫星", "潮汐", "登月"] },
                { id: "mars", zh: "火星", en: "Mars", wiki: "Mars", type: "行星", summary: "有极冠和峡谷，被称为红色星球。", period: "古代已知", year: -2000, region: "太阳系", lat: null, lng: null, tags: ["红色", "探测", "未来移民"] },
                { id: "jupiter", zh: "木星", en: "Jupiter", wiki: "Jupiter", type: "行星", summary: "太阳系最大行星，有著名的大红斑。", period: "古代已知", year: -2000, region: "太阳系", lat: null, lng: null, tags: ["最大", "气态", "大红斑"] },
                { id: "saturn", zh: "土星", en: "Saturn", wiki: "Saturn", type: "行星", summary: "拥有醒目的行星环。", period: "古代已知", year: -2000, region: "太阳系", lat: null, lng: null, tags: ["行星环", "气态", "美丽"] },
                { id: "rocket", zh: "运载火箭", en: "Rocket", wiki: "Rocket", type: "航天器", summary: "把卫星和飞船送入太空。", period: "现代航天", year: 1957, region: "发射场", lat: 28.5, lng: -80.6, tags: ["发射", "推进", "航天"] },
                { id: "iss", zh: "国际空间站", en: "ISS", wiki: "International_Space_Station", type: "空间站", summary: "多国合作的长期在轨实验室。", period: "现代航天", year: 1998, region: "近地轨道", lat: 45.0, lng: -120.0, tags: ["合作", "实验", "轨道"] }
            ]
        },
        {
            id: "vehicles",
            icon: "🚗",
            titleZh: "交通工具百科",
            titleEn: "Vehicle Explorer",
            description: "认识日常交通工具，理解速度、用途和安全规则。",
            semantic: {
                "飞": ["飞机", "直升机", "air"],
                "轨道": ["火车", "高铁", "rail"],
                "救援": ["救护车", "紧急", "安全"]
            },
            relations: [
                ["train", "highspeed", "轨道家族"],
                ["airplane", "helicopter", "空中交通"],
                ["ship", "submarine", "水上与水下"],
                ["bus", "ambulance", "道路车辆"],
                ["car", "bicycle", "日常出行"]
            ],
            items: [
                { id: "car", zh: "汽车", en: "Car", wiki: "Car", type: "道路交通", summary: "最常见的家庭出行工具。", period: "现代", year: 1886, region: "德国", lat: 48.8, lng: 9.2, tags: ["出行", "道路", "家庭"] },
                { id: "bicycle", zh: "自行车", en: "Bicycle", wiki: "Bicycle", type: "绿色出行", summary: "环保、健康，适合短途通勤。", period: "现代", year: 1817, region: "欧洲", lat: 48.1, lng: 11.6, tags: ["环保", "运动", "短途"] },
                { id: "train", zh: "火车", en: "Train", wiki: "Train", type: "轨道交通", summary: "适合中长距离运客和运输。", period: "工业时代", year: 1825, region: "英国", lat: 54.6, lng: -1.6, tags: ["轨道", "长途", "运输"] },
                { id: "highspeed", zh: "高铁", en: "High-speed Rail", wiki: "High-speed_rail", type: "轨道交通", summary: "高速列车让城市间通行更快。", period: "现代", year: 1964, region: "日本", lat: 35.7, lng: 139.7, tags: ["高速", "通勤", "现代"] },
                { id: "airplane", zh: "飞机", en: "Airplane", wiki: "Airplane", type: "航空交通", summary: "远距离最快的民用交通工具之一。", period: "现代", year: 1903, region: "美国", lat: 36.0, lng: -75.7, tags: ["飞行", "远程", "机场"] },
                { id: "helicopter", zh: "直升机", en: "Helicopter", wiki: "Helicopter", type: "航空交通", summary: "可垂直起降，适合救援和巡逻。", period: "现代", year: 1939, region: "美国", lat: 40.7, lng: -74.0, tags: ["垂直起降", "救援", "灵活"] },
                { id: "ship", zh: "轮船", en: "Ship", wiki: "Ship", type: "水路交通", summary: "海上运输主力。", period: "古今皆有", year: 1700, region: "全球港口", lat: 1.3, lng: 103.8, tags: ["海运", "港口", "货运"] },
                { id: "submarine", zh: "潜艇", en: "Submarine", wiki: "Submarine", type: "水路交通", summary: "可在水下航行，用于科研和防务。", period: "现代", year: 1954, region: "美国", lat: 41.5, lng: -71.3, tags: ["水下", "潜航", "科技"] },
                { id: "bus", zh: "公交车", en: "Bus", wiki: "Bus", type: "公共交通", summary: "城市公共出行的重要组成。", period: "现代", year: 1820, region: "城市", lat: 31.2, lng: 121.5, tags: ["公共交通", "城市", "通学"] },
                { id: "ambulance", zh: "救护车", en: "Ambulance", wiki: "Ambulance", type: "应急车辆", summary: "紧急医疗转运车辆。", period: "现代", year: 1865, region: "全球", lat: 51.5, lng: -0.1, tags: ["救援", "医疗", "紧急"] }
            ]
        },
        {
            id: "construction",
            icon: "🚜",
            titleZh: "工程车百科",
            titleEn: "Construction Machine Explorer",
            description: "挖掘、吊装、铺路都离不开它们。",
            semantic: {
                "挖": ["挖掘机", "反铲", "土方"],
                "吊": ["起重机", "塔吊", "吊装"],
                "压路": ["压路机", "道路", "施工"]
            },
            relations: [
                ["excavator", "dumptruck", "挖装联动"],
                ["crane", "towercrane", "吊装设备"],
                ["roller", "concretemixer", "道路施工"],
                ["tbm", "backhoe", "地下工程"]
            ],
            items: [
                { id: "excavator", zh: "挖掘机", en: "Excavator", wiki: "Excavator", type: "土方设备", summary: "用于挖土、装车和拆除。", period: "现代", year: 1835, region: "工地", lat: 31.2, lng: 121.5, tags: ["挖土", "液压", "工地"] },
                { id: "bulldozer", zh: "推土机", en: "Bulldozer", wiki: "Bulldozer", type: "土方设备", summary: "前铲可推平土石。", period: "现代", year: 1923, region: "工地", lat: 34.0, lng: -118.2, tags: ["推平", "履带", "土方"] },
                { id: "crane", zh: "起重机", en: "Crane", wiki: "Crane_(machine)", type: "吊装设备", summary: "用于吊运重物。", period: "现代", year: 1850, region: "港口与工地", lat: 22.3, lng: 114.2, tags: ["吊装", "重物", "施工"] },
                { id: "concretemixer", zh: "混凝土搅拌车", en: "Concrete Mixer Truck", wiki: "Concrete_mixer", type: "运输设备", summary: "运输并搅拌混凝土防止凝固。", period: "现代", year: 1916, region: "城市工地", lat: 39.9, lng: 116.4, tags: ["混凝土", "运输", "建筑"] },
                { id: "dumptruck", zh: "自卸车", en: "Dump Truck", wiki: "Dump_truck", type: "运输设备", summary: "用于短距离土石方运输。", period: "现代", year: 1910, region: "矿区与工地", lat: 46.5, lng: -80.9, tags: ["运输", "卸料", "矿区"] },
                { id: "roller", zh: "压路机", en: "Road Roller", wiki: "Road_roller", type: "道路设备", summary: "压实路基和沥青路面。", period: "现代", year: 1860, region: "道路施工", lat: 28.6, lng: 77.2, tags: ["压实", "道路", "施工"] },
                { id: "forklift", zh: "叉车", en: "Forklift", wiki: "Forklift", type: "仓储设备", summary: "在仓库搬运托盘货物。", period: "现代", year: 1917, region: "仓储中心", lat: 35.7, lng: 139.7, tags: ["搬运", "仓库", "托盘"] },
                { id: "tbm", zh: "盾构机", en: "Tunnel Boring Machine", wiki: "Tunnel_boring_machine", type: "地下设备", summary: "用于地铁和隧道开挖。", period: "现代", year: 1950, region: "地下工程", lat: 31.2, lng: 121.4, tags: ["隧道", "盾构", "地铁"] },
                { id: "backhoe", zh: "反铲装载机", en: "Backhoe Loader", wiki: "Backhoe_loader", type: "多功能设备", summary: "兼具装载和挖掘功能。", period: "现代", year: 1953, region: "工地", lat: 52.5, lng: -1.9, tags: ["多功能", "挖掘", "装载"] },
                { id: "towercrane", zh: "塔吊", en: "Tower Crane", wiki: "Tower_crane", type: "吊装设备", summary: "高层建筑施工常见设备。", period: "现代", year: 1949, region: "高层工地", lat: 40.7, lng: -74.0, tags: ["高层", "吊装", "施工"] }
            ]
        },
        {
            id: "humanbody",
            icon: "🫀",
            titleZh: "人体百科",
            titleEn: "Human Body Explorer",
            description: "认识身体系统，培养健康习惯。",
            semantic: {
                "呼吸": ["肺", "氧气", "breath"],
                "消化": ["胃", "肝脏", "digest"],
                "感官": ["眼睛", "皮肤", "感觉"]
            },
            relations: [
                ["heart", "lungs", "循环与呼吸"],
                ["brain", "eyes", "视觉处理"],
                ["stomach", "liver", "消化协作"],
                ["bones", "muscles", "支撑运动"],
                ["skin", "kidneys", "排泄调节"]
            ],
            items: [
                { id: "brain", zh: "大脑", en: "Brain", wiki: "Brain", type: "神经系统", summary: "控制思考、记忆、感觉与动作。", period: "生命科学", year: 1664, region: "人体", lat: null, lng: null, tags: ["思考", "神经", "控制"] },
                { id: "heart", zh: "心脏", en: "Heart", wiki: "Heart", type: "循环系统", summary: "把血液泵送到全身。", period: "生命科学", year: 1628, region: "人体", lat: null, lng: null, tags: ["泵血", "循环", "生命"] },
                { id: "lungs", zh: "肺", en: "Lungs", wiki: "Lung", type: "呼吸系统", summary: "吸入氧气、排出二氧化碳。", period: "生命科学", year: 1550, region: "人体", lat: null, lng: null, tags: ["呼吸", "氧气", "气体交换"] },
                { id: "stomach", zh: "胃", en: "Stomach", wiki: "Stomach", type: "消化系统", summary: "初步分解食物。", period: "生命科学", year: 1700, region: "人体", lat: null, lng: null, tags: ["消化", "食物", "营养"] },
                { id: "liver", zh: "肝脏", en: "Liver", wiki: "Liver", type: "消化系统", summary: "解毒、代谢并产生胆汁。", period: "生命科学", year: 1700, region: "人体", lat: null, lng: null, tags: ["解毒", "代谢", "胆汁"] },
                { id: "kidneys", zh: "肾脏", en: "Kidneys", wiki: "Kidney", type: "泌尿系统", summary: "过滤血液并产生尿液。", period: "生命科学", year: 1700, region: "人体", lat: null, lng: null, tags: ["过滤", "排泄", "水盐平衡"] },
                { id: "bones", zh: "骨骼", en: "Skeleton", wiki: "Human_skeleton", type: "运动系统", summary: "支撑身体并保护重要器官。", period: "生命科学", year: 1543, region: "人体", lat: null, lng: null, tags: ["支撑", "保护", "结构"] },
                { id: "muscles", zh: "肌肉", en: "Muscle", wiki: "Muscle", type: "运动系统", summary: "收缩舒张带来动作。", period: "生命科学", year: 1600, region: "人体", lat: null, lng: null, tags: ["运动", "力量", "收缩"] },
                { id: "skin", zh: "皮肤", en: "Skin", wiki: "Skin", type: "保护系统", summary: "人体最大的器官，负责保护和感知。", period: "生命科学", year: 1600, region: "人体", lat: null, lng: null, tags: ["保护", "触觉", "温度"] },
                { id: "eyes", zh: "眼睛", en: "Eyes", wiki: "Eye", type: "感官系统", summary: "把光信息传给大脑形成视觉。", period: "生命科学", year: 1604, region: "人体", lat: null, lng: null, tags: ["视觉", "感官", "光"] }
            ]
        },
        {
            id: "weather",
            icon: "⛅",
            titleZh: "天气百科",
            titleEn: "Weather Explorer",
            description: "学习天气现象和安全知识。",
            semantic: {
                "下雨": ["雨", "雷暴", "台风"],
                "冬天": ["雪", "冰雹", "寒冷"],
                "彩虹": ["阳光", "雨后", "光"]
            },
            relations: [
                ["sunny", "rainbow", "雨后见彩虹"],
                ["cloudy", "rain", "云水滴凝结"],
                ["rain", "thunderstorm", "强对流升级"],
                ["typhoon", "rain", "带来暴雨"],
                ["tornado", "thunderstorm", "雷暴伴生"]
            ],
            items: [
                { id: "sunny", zh: "晴天", en: "Sunny", wiki: "Sunshine", type: "基础天气", summary: "天空少云、光照充足。", period: "日常", year: 0, region: "全球", lat: 30.0, lng: 114.0, tags: ["阳光", "户外", "光照"] },
                { id: "cloudy", zh: "多云", en: "Cloudy", wiki: "Cloud", type: "基础天气", summary: "云层较多，阳光被部分遮挡。", period: "日常", year: 0, region: "全球", lat: 51.5, lng: -0.1, tags: ["云层", "阴天", "变化"] },
                { id: "rain", zh: "下雨", en: "Rain", wiki: "Rain", type: "降水天气", summary: "水汽凝结成雨滴落下。", period: "日常", year: 0, region: "全球", lat: 1.3, lng: 103.8, tags: ["降水", "雨伞", "积水"] },
                { id: "thunderstorm", zh: "雷暴", en: "Thunderstorm", wiki: "Thunderstorm", type: "强对流", summary: "常伴随雷电、强降雨和大风。", period: "季节性", year: 0, region: "全球", lat: 13.0, lng: -59.6, tags: ["雷电", "大风", "强对流"] },
                { id: "snow", zh: "下雪", en: "Snow", wiki: "Snow", type: "降水天气", summary: "气温低时形成雪花。", period: "冬季", year: 0, region: "高纬地区", lat: 60.1, lng: 24.9, tags: ["冬季", "低温", "雪花"] },
                { id: "rainbow", zh: "彩虹", en: "Rainbow", wiki: "Rainbow", type: "光学现象", summary: "阳光在水滴中折射和反射形成色带。", period: "雨后", year: 0, region: "全球", lat: 23.5, lng: 121.0, tags: ["光学", "七色", "雨后"] },
                { id: "fog", zh: "雾", en: "Fog", wiki: "Fog", type: "低能见度", summary: "近地面空气中的小水滴导致能见度下降。", period: "日常", year: 0, region: "河湖海岸", lat: 37.8, lng: -122.4, tags: ["能见度", "湿冷", "交通安全"] },
                { id: "typhoon", zh: "台风", en: "Typhoon", wiki: "Typhoon", type: "热带气旋", summary: "西北太平洋强热带气旋，风雨很大。", period: "夏秋", year: 0, region: "西北太平洋", lat: 18.5, lng: 124.0, tags: ["强风", "暴雨", "防灾"] },
                { id: "tornado", zh: "龙卷风", en: "Tornado", wiki: "Tornado", type: "强对流", summary: "旋转气柱接触地面，破坏力极强。", period: "季节性", year: 0, region: "北美平原", lat: 35.5, lng: -97.5, tags: ["旋转", "极端天气", "预警"] },
                { id: "hail", zh: "冰雹", en: "Hail", wiki: "Hail", type: "强对流", summary: "雷暴云中形成的冰粒降落。", period: "季节性", year: 0, region: "高原与内陆", lat: 34.3, lng: 108.9, tags: ["冰粒", "雷暴", "防护"] }
            ]
        },
        {
            id: "plants",
            icon: "🌱",
            titleZh: "植物水果百科",
            titleEn: "Plant Explorer",
            description: "认识常见植物、粮食和花卉。",
            semantic: {
                "粮食": ["水稻", "小麦", "主食"],
                "花": ["向日葵", "玫瑰", "荷花"],
                "树": ["苹果树", "橡树", "松树"]
            },
            relations: [
                ["rice", "wheat", "主要粮食"],
                ["sunflower", "rose", "传粉关联"],
                ["apple", "oak", "树木类"],
                ["lotus", "bamboo", "东方文化象征"]
            ],
            items: [
                { id: "apple", zh: "苹果树", en: "Apple Tree", wiki: "Apple", type: "果树", summary: "常见温带果树，果实营养丰富。", period: "农业", year: -3000, region: "欧亚", lat: 45.0, lng: 25.0, tags: ["果树", "营养", "种植"] },
                { id: "bamboo", zh: "竹子", en: "Bamboo", wiki: "Bamboo", type: "禾本科", summary: "生长快，可用于建筑和手工。", period: "农业", year: -2000, region: "东亚", lat: 30.6, lng: 104.1, tags: ["生长快", "材料", "东方"] },
                { id: "sunflower", zh: "向日葵", en: "Sunflower", wiki: "Helianthus", type: "花卉", summary: "花盘会追随太阳方向变化。", period: "农业", year: 1500, region: "美洲", lat: 39.0, lng: -98.0, tags: ["向光", "花卉", "种子"] },
                { id: "cactus", zh: "仙人掌", en: "Cactus", wiki: "Cactus", type: "多肉植物", summary: "耐旱，适应沙漠环境。", period: "自然生态", year: 0, region: "美洲干旱区", lat: 23.6, lng: -102.5, tags: ["耐旱", "沙漠", "储水"] },
                { id: "rice", zh: "水稻", en: "Rice", wiki: "Rice", type: "粮食作物", summary: "全球主要主食作物之一。", period: "农业", year: -7000, region: "亚洲", lat: 22.3, lng: 114.2, tags: ["主食", "稻田", "粮食"] },
                { id: "wheat", zh: "小麦", en: "Wheat", wiki: "Wheat", type: "粮食作物", summary: "可加工面粉制作面包和面条。", period: "农业", year: -9000, region: "西亚", lat: 33.3, lng: 44.4, tags: ["面粉", "主食", "粮食"] },
                { id: "oak", zh: "橡树", en: "Oak", wiki: "Oak", type: "乔木", summary: "寿命长，木材坚硬。", period: "森林生态", year: 0, region: "北半球", lat: 48.8, lng: 2.3, tags: ["木材", "森林", "坚硬"] },
                { id: "lotus", zh: "荷花", en: "Lotus", wiki: "Nelumbo_nucifera", type: "水生植物", summary: "常见于湖塘，叶片具有疏水性。", period: "园艺", year: -1000, region: "亚洲", lat: 30.3, lng: 120.2, tags: ["水生", "花卉", "荷叶"] },
                { id: "pine", zh: "松树", en: "Pine", wiki: "Pine", type: "针叶树", summary: "常绿树种，适应寒冷山区。", period: "森林生态", year: 0, region: "北半球", lat: 56.8, lng: 60.6, tags: ["常绿", "针叶", "耐寒"] },
                { id: "rose", zh: "玫瑰", en: "Rose", wiki: "Rose", type: "花卉", summary: "观赏价值高，也是常见香料植物。", period: "园艺", year: -500, region: "欧亚", lat: 41.0, lng: 29.0, tags: ["花卉", "香味", "园艺"] }
            ]
        },
        {
            id: "countries",
            icon: "🌍",
            titleZh: "国家地标百科",
            titleEn: "Country Explorer",
            description: "通过国家、国旗和地标认识世界。",
            semantic: {
                "亚洲": ["中国", "日本", "印度"],
                "非洲": ["埃及", "肯尼亚"],
                "美洲": ["美国", "巴西", "加拿大"]
            },
            relations: [
                ["china", "japan", "东亚邻近"],
                ["usa", "canada", "北美邻国"],
                ["france", "egypt", "世界文化遗产众多"],
                ["india", "australia", "印度洋联系"]
            ],
            items: [
                { id: "china", zh: "中国", en: "China", wiki: "China", type: "亚洲", summary: "拥有长城、故宫等丰富文化遗产。", period: "现代国家", year: 1949, region: "东亚", lat: 39.9, lng: 116.4, tags: ["长城", "熊猫", "亚洲"] },
                { id: "usa", zh: "美国", en: "United States", wiki: "United_States", type: "北美", summary: "科技与教育资源丰富。", period: "现代国家", year: 1776, region: "北美", lat: 38.9, lng: -77.0, tags: ["北美", "科技", "国家公园"] },
                { id: "japan", zh: "日本", en: "Japan", wiki: "Japan", type: "亚洲", summary: "岛国，以樱花和新干线闻名。", period: "现代国家", year: 1947, region: "东亚", lat: 35.7, lng: 139.7, tags: ["岛国", "樱花", "高铁"] },
                { id: "egypt", zh: "埃及", en: "Egypt", wiki: "Egypt", type: "非洲", summary: "金字塔和尼罗河文明闻名世界。", period: "现代国家", year: 1922, region: "北非", lat: 30.0, lng: 31.2, tags: ["金字塔", "尼罗河", "古文明"] },
                { id: "brazil", zh: "巴西", en: "Brazil", wiki: "Brazil", type: "南美", summary: "拥有亚马逊雨林和足球文化。", period: "现代国家", year: 1822, region: "南美", lat: -15.8, lng: -47.9, tags: ["雨林", "足球", "热带"] },
                { id: "france", zh: "法国", en: "France", wiki: "France", type: "欧洲", summary: "巴黎埃菲尔铁塔和艺术文化著名。", period: "现代国家", year: 1792, region: "欧洲", lat: 48.8, lng: 2.3, tags: ["艺术", "美食", "欧洲"] },
                { id: "australia", zh: "澳大利亚", en: "Australia", wiki: "Australia", type: "大洋洲", summary: "拥有独特动物和大堡礁。", period: "现代国家", year: 1901, region: "大洋洲", lat: -35.3, lng: 149.1, tags: ["袋鼠", "珊瑚礁", "南半球"] },
                { id: "kenya", zh: "肯尼亚", en: "Kenya", wiki: "Kenya", type: "非洲", summary: "以草原野生动物和马拉松闻名。", period: "现代国家", year: 1963, region: "东非", lat: -1.3, lng: 36.8, tags: ["草原", "动物迁徙", "非洲"] },
                { id: "canada", zh: "加拿大", en: "Canada", wiki: "Canada", type: "北美", summary: "国土广阔，森林和湖泊资源丰富。", period: "现代国家", year: 1867, region: "北美", lat: 45.4, lng: -75.7, tags: ["森林", "湖泊", "北美"] },
                { id: "india", zh: "印度", en: "India", wiki: "India", type: "亚洲", summary: "人口众多，历史文化非常丰富。", period: "现代国家", year: 1947, region: "南亚", lat: 28.6, lng: 77.2, tags: ["南亚", "泰姬陵", "多语言"] }
            ]
        },
        {
            id: "jobs",
            icon: "🧑‍🚒",
            titleZh: "职业百科",
            titleEn: "Job Explorer",
            description: "认识社会分工，理解每种职业的价值。",
            semantic: {
                "救人": ["医生", "消防员", "警察", "救护"],
                "飞": ["飞行员", "astronaut", "天空"],
                "做饭": ["厨师", "餐厅", "食物"]
            },
            relations: [
                ["doctor", "nurse", "医疗协作"],
                ["firefighter", "police", "应急协作"],
                ["teacher", "scientist", "知识传承"],
                ["engineer", "pilot", "技术与执行"],
                ["farmer", "chef", "从农田到餐桌"]
            ],
            items: [
                { id: "doctor", zh: "医生", en: "Doctor", wiki: "Physician", type: "医疗", summary: "诊断疾病并提供治疗方案。", period: "现代职业", year: 0, region: "医院", lat: 31.2, lng: 121.5, tags: ["医疗", "救治", "健康"] },
                { id: "nurse", zh: "护士", en: "Nurse", wiki: "Nursing", type: "医疗", summary: "照护病人并执行护理工作。", period: "现代职业", year: 0, region: "医院", lat: 34.0, lng: -118.2, tags: ["护理", "关怀", "医院"] },
                { id: "firefighter", zh: "消防员", en: "Firefighter", wiki: "Firefighter", type: "应急", summary: "灭火并参与抢险救援。", period: "现代职业", year: 0, region: "消防站", lat: 40.7, lng: -74.0, tags: ["灭火", "救援", "勇敢"] },
                { id: "police", zh: "警察", en: "Police Officer", wiki: "Police_officer", type: "公共安全", summary: "维护社会秩序和公共安全。", period: "现代职业", year: 0, region: "城市", lat: 51.5, lng: -0.1, tags: ["安全", "秩序", "执法"] },
                { id: "chef", zh: "厨师", en: "Chef", wiki: "Chef", type: "餐饮", summary: "制作餐食并设计菜单。", period: "现代职业", year: 0, region: "餐厅", lat: 48.8, lng: 2.3, tags: ["烹饪", "美食", "创意"] },
                { id: "teacher", zh: "老师", en: "Teacher", wiki: "Teacher", type: "教育", summary: "帮助学生学习知识与技能。", period: "现代职业", year: 0, region: "学校", lat: 39.9, lng: 116.4, tags: ["教育", "成长", "课堂"] },
                { id: "engineer", zh: "工程师", en: "Engineer", wiki: "Engineer", type: "技术", summary: "设计和实现技术方案。", period: "现代职业", year: 0, region: "企业", lat: 37.4, lng: -122.1, tags: ["设计", "创新", "技术"] },
                { id: "pilot", zh: "飞行员", en: "Pilot", wiki: "Pilot_(aeronautics)", type: "交通运输", summary: "驾驶飞机进行航线飞行。", period: "现代职业", year: 0, region: "机场", lat: 25.8, lng: -80.2, tags: ["航空", "责任", "飞行"] },
                { id: "farmer", zh: "农民", en: "Farmer", wiki: "Farmer", type: "农业", summary: "种植粮食与蔬果，保障食物供应。", period: "现代职业", year: 0, region: "农田", lat: 30.6, lng: 114.3, tags: ["农业", "粮食", "土地"] },
                { id: "scientist", zh: "科学家", en: "Scientist", wiki: "Scientist", type: "科研", summary: "通过实验和研究探索世界规律。", period: "现代职业", year: 0, region: "实验室", lat: 42.4, lng: -71.1, tags: ["实验", "探索", "发现"] }
            ]
        },
        {
            id: "festivals",
            icon: "🎉",
            titleZh: "节日文化百科",
            titleEn: "Festival Explorer",
            description: "通过节日认识不同文化的习俗和食物。",
            semantic: {
                "中国节日": ["春节", "中秋", "端午"],
                "西方节日": ["圣诞", "万圣节", "感恩节"],
                "泼水": ["宋干节", "泰国", "water"]
            },
            relations: [
                ["springfest", "midautumn", "中国传统节日"],
                ["christmas", "thanksgiving", "家庭聚会"],
                ["diwali", "eid", "宗教文化节日"],
                ["songkran", "carnival", "街头庆典"]
            ],
            items: [
                { id: "springfest", zh: "春节", en: "Spring Festival", wiki: "Chinese_New_Year", type: "东亚节日", summary: "农历新年，常有团圆饭和拜年。", period: "传统节日", year: -1000, region: "中国", lat: 39.9, lng: 116.4, tags: ["团圆", "红包", "新年"] },
                { id: "midautumn", zh: "中秋节", en: "Mid-Autumn Festival", wiki: "Mid-Autumn_Festival", type: "东亚节日", summary: "赏月、吃月饼、家人团聚。", period: "传统节日", year: -800, region: "中国", lat: 31.2, lng: 121.5, tags: ["月亮", "月饼", "团圆"] },
                { id: "dragonboat", zh: "端午节", en: "Dragon Boat Festival", wiki: "Dragon_Boat_Festival", type: "东亚节日", summary: "赛龙舟、吃粽子。", period: "传统节日", year: -300, region: "中国", lat: 23.1, lng: 113.3, tags: ["龙舟", "粽子", "传统"] },
                { id: "christmas", zh: "圣诞节", en: "Christmas", wiki: "Christmas", type: "全球节日", summary: "装饰圣诞树、交换礼物。", period: "现代节庆", year: 336, region: "欧洲起源", lat: 41.9, lng: 12.5, tags: ["礼物", "圣诞树", "冬季"] },
                { id: "halloween", zh: "万圣节", en: "Halloween", wiki: "Halloween", type: "西方节日", summary: "装扮和“不给糖就捣蛋”活动。", period: "现代节庆", year: 1745, region: "欧美", lat: 53.3, lng: -6.2, tags: ["南瓜", "装扮", "糖果"] },
                { id: "diwali", zh: "排灯节", en: "Diwali", wiki: "Diwali", type: "南亚节日", summary: "以灯火庆祝光明和希望。", period: "传统节日", year: -200, region: "印度", lat: 28.6, lng: 77.2, tags: ["灯火", "家庭", "庆祝"] },
                { id: "eid", zh: "开斋节", en: "Eid al-Fitr", wiki: "Eid_al-Fitr", type: "宗教节日", summary: "斋月后庆祝与分享。", period: "宗教节日", year: 624, region: "中东", lat: 24.7, lng: 46.7, tags: ["团聚", "分享", "节庆"] },
                { id: "thanksgiving", zh: "感恩节", en: "Thanksgiving", wiki: "Thanksgiving", type: "北美节日", summary: "家庭聚餐，表达感恩。", period: "现代节庆", year: 1863, region: "美国", lat: 38.9, lng: -77.0, tags: ["感恩", "火鸡", "家庭"] },
                { id: "songkran", zh: "宋干节", en: "Songkran", wiki: "Songkran_(Thailand)", type: "东南亚节日", summary: "泰国传统新年，泼水庆祝。", period: "传统节日", year: 0, region: "泰国", lat: 13.8, lng: 100.5, tags: ["泼水", "新年", "东南亚"] },
                { id: "carnival", zh: "狂欢节", en: "Carnival", wiki: "Carnival", type: "拉美节日", summary: "音乐舞蹈和花车巡游十分热闹。", period: "现代节庆", year: 1723, region: "巴西", lat: -22.9, lng: -43.2, tags: ["巡游", "音乐", "舞蹈"] }
            ]
        }
    ]
};
