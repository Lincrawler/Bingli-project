import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import bgImage from '../assets/doc4.png';

type Role = 'doctor' | 'patient' | 'system';
interface Msg { role: Role; text: string }

type Phase = 'INFO_COLLECTION' | 'PRELIMINARY_DIAGNOSIS' | 'AUXILIARY_VERIFICATION' | 'TREATMENT_PLAN';

const phaseConfig: Record<Phase, { name: string; description: string; next: Phase | null }> = {
  INFO_COLLECTION: { name: '信息采集', description: '请系统性询问患者情况，包括主诉、现病史、既往史等。可进行视、触、叩、听诊。' , next: 'PRELIMINARY_DIAGNOSIS' },
  PRELIMINARY_DIAGNOSIS: { name: '初步判断', description: '基于当前信息，提出最可能的疾病假设。' , next: 'AUXILIARY_VERIFICATION' },
  AUXILIARY_VERIFICATION: { name: '辅助验证', description: '为验证诊断，请开具针对性检查，如实验室、影像学检查。' , next: 'TREATMENT_PLAN' },
  TREATMENT_PLAN: { name: '治疗和评估', description: '根据诊断结果，制定治疗方案，如药物、手术或生活方式干预。' , next: null },
};

// 根据caseId生成对应的患者档案
function generatePatientProfile(caseId: string) {
  const profiles: Record<string, { trueDiagnosis: string; responses: Record<string, string> }> = {
    // 内科病例
    'int-001': {
      trueDiagnosis: '原发性高血压',
      responses: {
        '主诉': '医生您好，我最近测量血压偏高，想咨询初诊建议。',
        '现病史': '最近一个月在家测血压都在150/95左右，有时候会头晕，特别是早上起床的时候。没有胸痛胸闷，睡眠还可以。',
        '既往史': '以前体检血压都正常，没有心脏病史，也没有其他慢性疾病。',
        '过敏史': '没有药物过敏史。',
        '个人史': '工作压力比较大，经常熬夜，抽烟10年了，每天大概一包，偶尔喝酒。',
        '家族病史': '我父亲有高血压，母亲身体还好。',
        '视诊': '患者神志清楚，精神可，面色正常，无水肿。',
        '触诊': '颈部血管无异常搏动，腹部柔软，无压痛，双下肢无水肿。',
        '叩诊': '心界不大，肺部叩诊正常。',
        '听诊': '心率78次/分，律齐，无杂音，双肺呼吸音清晰。',
        '检查结果': '血压160/100mmHg，心电图显示窦性心律，胸片正常，血脂轻度升高。'
      }
    },
    'int-002': {
      trueDiagnosis: '2型糖尿病',
      responses: {
        '主诉': '医生您好，我在进行糖尿病随访，血糖控制方面想请您指导。',
        '现病史': '确诊糖尿病2年了，一直在服用二甲双胍，最近血糖控制不太理想，空腹血糖经常在8-9之间。',
        '既往史': '2年前体检发现血糖高，确诊为2型糖尿病，没有其他重大疾病史。',
        '过敏史': '无已知药物过敏。',
        '个人史': '饮食控制不够严格，运动量不足，不抽烟，偶尔喝酒。',
        '家族病史': '母亲也有糖尿病，父亲有高血压。',
        '视诊': '患者体型偏胖，精神可，无明显异常。',
        '触诊': '腹部稍胖，柔软，肝脾未触及，双足感觉正常。',
        '叩诊': '心肺叩诊无异常。',
        '听诊': '心肺听诊正常。',
        '检查结果': '空腹血糖8.5mmol/L，糖化血红蛋白7.8%，尿常规正常，眼底检查无异常。'
      }
    },
    'int-003': {
      trueDiagnosis: '慢性胃炎',
      responses: {
        '主诉': '医生您好，我长期胃部不适，想评估慢性胃炎情况。',
        '现病史': '胃部不适有半年多了，主要是饭后胃胀，有时候会反酸，食欲还可以，体重没有明显变化。',
        '既往史': '以前偶尔有胃痛，但不严重，没有做过胃镜检查。',
        '过敏史': '无药物过敏史。',
        '个人史': '工作忙经常不按时吃饭，喜欢吃辣的，不抽烟，偶尔喝酒。',
        '家族病史': '家族无胃癌等消化道肿瘤病史。',
        '视诊': '患者一般情况好，无贫血貌。',
        '触诊': '上腹部轻压痛，无包块，肝脾未触及。',
        '叩诊': '腹部叩诊无异常。',
        '听诊': '肠鸣音正常。',
        '检查结果': '胃镜显示慢性浅表性胃炎，幽门螺杆菌阳性，血常规正常。'
      }
    },
    // 外科病例
    'sur-001': {
      trueDiagnosis: '阑尾炎术后恢复期',
      responses: {
        '主诉': '医生您好，我做了阑尾手术，今天来做术后复查。',
        '现病史': '一周前做的腹腔镜阑尾切除术，现在伤口愈合还可以，偶尔有点疼，食欲恢复了。',
        '既往史': '以前身体健康，这次是第一次手术。',
        '过敏史': '无药物过敏史。',
        '个人史': '不抽烟不喝酒，平时身体还不错。',
        '家族病史': '家族无特殊疾病史。',
        '视诊': '患者精神好，腹部有3个小切口，愈合良好。',
        '触诊': '腹部柔软，切口无红肿，轻压痛，无包块。',
        '叩诊': '腹部叩诊无异常。',
        '听诊': '肠鸣音正常。',
        '检查结果': '血常规正常，切口愈合良好，无感染征象。'
      }
    },
    'sur-002': {
      trueDiagnosis: '腹股沟疝',
      responses: {
        '主诉': '医生您好，最近腹股沟鼓起不适，怀疑疝气，想评估一下。',
        '现病史': '最近2个月发现右侧腹股沟有包块，站立时明显，平躺时消失，有时候会有胀痛感。',
        '既往史': '以前没有类似情况，没有做过腹部手术。',
        '过敏史': '无药物过敏史。',
        '个人史': '工作需要经常搬重物，不抽烟，偶尔喝酒。',
        '家族病史': '父亲年轻时也有过疝气。',
        '视诊': '站立位右侧腹股沟可见包块突出。',
        '触诊': '右侧腹股沟包块质软，可还纳，咳嗽时有冲击感。',
        '叩诊': '腹部叩诊无异常。',
        '听诊': '肠鸣音正常。',
        '检查结果': '腹部B超提示右侧腹股沟疝，肠管突出。'
      }
    },
    'sur-003': {
      trueDiagnosis: '甲状腺结节',
      responses: {
        '主诉': '医生您好，体检发现甲状腺结节，想进一步评估与处理。',
        '现病史': '上个月体检B超发现甲状腺结节，平时没有特别的症状，吞咽正常，声音也没变化。',
        '既往史': '以前没有甲状腺疾病，也没有颈部放射史。',
        '过敏史': '无药物过敏史。',
        '个人史': '生活规律，不抽烟不喝酒。',
        '家族病史': '母亲有甲状腺功能减退。',
        '视诊': '颈部外观正常，无明显肿大。',
        '触诊': '甲状腺右叶可触及约1cm结节，质地中等，活动度好。',
        '叩诊': '无异常。',
        '听诊': '甲状腺区无血管杂音。',
        '检查结果': '甲状腺B超显示右叶1.2cm低回声结节，边界清楚，甲功正常。'
      }
    },
    // 儿科病例
    'ped-001': {
      trueDiagnosis: '小儿急性上呼吸道感染',
      responses: {
        '主诉': '医生您好，孩子这几天发热，想请您帮忙看看。',
        '现病史': '孩子3岁，发热2天了，最高39度，有点咳嗽和流鼻涕，食欲不太好，精神还可以。',
        '既往史': '孩子平时身体还好，按时接种疫苗，很少生病。',
        '过敏史': '无药物过敏史。',
        '个人史': '在幼儿园上学，最近班里有小朋友感冒。',
        '家族病史': '家族无特殊疾病史。',
        '视诊': '患儿精神稍差，面色微红，鼻塞，轻咳。',
        '触诊': '颈部淋巴结无肿大，腹部柔软。',
        '叩诊': '胸部叩诊正常。',
        '听诊': '双肺呼吸音粗，无明显啰音，心率正常。',
        '检查结果': '体温38.5℃，血常规显示病毒感染，咽部充血。'
      }
    },
    'ped-002': {
      trueDiagnosis: '小儿过敏性咳嗽',
      responses: {
        '主诉': '医生您好，孩子咳嗽迁延不愈，想评估一下原因。',
        '现病史': '孩子5岁，咳嗽1个多月了，主要是干咳，晚上和早上比较明显，没有发热，精神食欲都还好。',
        '既往史': '孩子有过敏性鼻炎，春秋季节容易发作。',
        '过敏史': '对花粉过敏，鸡蛋过敏。',
        '个人史': '家里养了小猫，孩子很喜欢。',
        '家族病史': '父亲有哮喘，母亲有过敏性鼻炎。',
        '视诊': '患儿一般情况好，无呼吸困难。',
        '触诊': '胸廓对称，无异常。',
        '叩诊': '双肺叩诊清音。',
        '听诊': '双肺呼吸音清晰，无哮鸣音。',
        '检查结果': '胸片正常，过敏原检测阳性，肺功能轻度异常。'
      }
    },
    'ped-003': {
      trueDiagnosis: '小儿急性胃肠炎',
      responses: {
        '主诉': '医生您好，孩子最近腹泻，想咨询处理与护理方案。',
        '现病史': '孩子2岁，腹泻3天了，每天5-6次，大便稀水样，有时候会吐，食欲不好。',
        '既往史': '孩子平时身体健康，没有慢性腹泻史。',
        '过敏史': '无药物过敏史。',
        '个人史': '前几天吃了不太新鲜的水果。',
        '家族病史': '家族无特殊疾病史。',
        '视诊': '患儿精神稍差，轻度脱水征。',
        '触诊': '腹部柔软，肠鸣音活跃。',
        '叩诊': '腹部叩诊无异常。',
        '听诊': '肠鸣音亢进。',
        '检查结果': '大便常规有白细胞，轮状病毒抗原阳性。'
      }
    },
    // 妇产科病例
    'gyn-001': {
      trueDiagnosis: '正常早孕',
      responses: {
        '主诉': '医生您好，我现在处于孕早期，想了解保健与检查安排。',
        '现病史': '末次月经6周前，早孕试纸阳性，有轻微恶心，乳房胀痛，无阴道出血。',
        '既往史': '月经规律，无妇科疾病史，这是第一次怀孕。',
        '过敏史': '无药物过敏史。',
        '个人史': '不抽烟不喝酒，准备怀孕期间有服用叶酸。',
        '家族病史': '家族无遗传性疾病。',
        '视诊': '一般情况好，无贫血貌。',
        '触诊': '子宫稍增大，质软，无压痛。',
        '叩诊': '无异常。',
        '听诊': '心肺正常。',
        '检查结果': 'HCG阳性，B超显示宫内早孕，胎心正常。'
      }
    },
    'gyn-002': {
      trueDiagnosis: '产后正常恢复',
      responses: {
        '主诉': '医生您好，我来做产后复查，恢复情况想请您评估。',
        '现病史': '顺产后6周，恶露已经干净，伤口愈合好，哺乳正常，月经还没来。',
        '既往史': '孕期无并发症，顺产，新生儿健康。',
        '过敏史': '无药物过敏史。',
        '个人史': '纯母乳喂养，休息充足。',
        '家族病史': '家族无特殊疾病史。',
        '视诊': '一般情况好，精神佳。',
        '触诊': '子宫复旧良好，会阴伤口愈合好。',
        '叩诊': '无异常。',
        '听诊': '心肺正常。',
        '检查结果': '妇科检查正常，子宫复旧良好，无感染征象。'
      }
    },
    'gyn-003': {
      trueDiagnosis: '功能性子宫出血',
      responses: {
        '主诉': '医生您好，我月经不调，想门诊咨询并检查。',
        '现病史': '最近半年月经不规律，有时候2个月不来，有时候来了10多天才干净，量也不稳定。',
        '既往史': '以前月经还算规律，没有妇科手术史。',
        '过敏史': '无药物过敏史。',
        '个人史': '工作压力大，经常熬夜，体重有所增加。',
        '家族病史': '母亲更年期较早。',
        '视诊': '一般情况可，稍显疲倦。',
        '触诊': '子宫正常大小，无压痛，附件无异常。',
        '叩诊': '无异常。',
        '听诊': '心肺正常。',
        '检查结果': '性激素检查异常，B超显示子宫内膜增厚。'
      }
    },
    // 急诊科病例
    'eme-001': {
      trueDiagnosis: '急性心肌梗死',
      responses: {
        '主诉': '医生您好，我突发胸痛不适，想了解急诊处置方案。',
        '现病史': '1小时前突然出现胸骨后压榨性疼痛，向左臂放射，伴出汗，含硝酸甘油无缓解。',
        '既往史': '有高血压、糖尿病史，平时服药控制。',
        '过敏史': '无药物过敏史。',
        '个人史': '抽烟20年，每天1包，偶尔喝酒。',
        '家族病史': '父亲有冠心病史。',
        '视诊': '患者面色苍白，大汗淋漓，表情痛苦。',
        '触诊': '脉搏细弱，血压偏低。',
        '叩诊': '心界稍扩大。',
        '听诊': '心率快，可闻及奔马律，肺部有湿啰音。',
        '检查结果': '心电图显示急性前壁心肌梗死，肌钙蛋白明显升高。'
      }
    },
    'eme-002': {
      trueDiagnosis: '多发性外伤',
      responses: {
        '主诉': '医生您好，我有外伤，想做一个初步评估与处理。',
        '现病史': '30分钟前车祸外伤，头部撞击，右臂疼痛，意识清楚，无恶心呕吐。',
        '既往史': '平时身体健康，无重大疾病史。',
        '过敏史': '无药物过敏史。',
        '个人史': '不抽烟不喝酒。',
        '家族病史': '家族无特殊疾病史。',
        '视诊': '头部有外伤，右前臂肿胀变形。',
        '触诊': '头部有血肿，右前臂压痛明显，活动受限。',
        '叩诊': '胸腹部叩诊无异常。',
        '听诊': '心肺听诊正常。',
        '检查结果': '头颅CT无异常，右尺桡骨骨折，其他检查正常。'
      }
    },
    'eme-003': {
      trueDiagnosis: '急性哮喘发作',
      responses: {
        '主诉': '医生您好，我出现呼吸困难，请帮忙紧急处理。',
        '现病史': '2小时前开始呼吸困难，喘息，咳嗽，用了平时的喷雾剂效果不好。',
        '既往史': '有支气管哮喘10年，平时用沙丁胺醇控制。',
        '过敏史': '对花粉、尘螨过敏。',
        '个人史': '今天打扫房间接触了很多灰尘。',
        '家族病史': '母亲有哮喘。',
        '视诊': '患者端坐呼吸，口唇轻度发绀。',
        '触诊': '胸廓饱满，触觉语颤减弱。',
        '叩诊': '双肺过清音。',
        '听诊': '双肺广泛哮鸣音，呼气延长。',
        '检查结果': '血氧饱和度90%，胸片显示肺气肿改变。'
      }
    },
    // 心内科病例
    'car-001': {
      trueDiagnosis: '稳定性心绞痛',
      responses: {
        '主诉': '医生您好，近来出现胸闷胸痛，怀疑心绞痛，想咨询。',
        '现病史': '最近1个月活动时出现胸闷胸痛，休息后缓解，每次持续3-5分钟，含硝酸甘油有效。',
        '既往史': '有高血压、高血脂史，服药治疗中。',
        '过敏史': '无药物过敏史。',
        '个人史': '抽烟15年，工作压力大，缺乏运动。',
        '家族病史': '父亲有冠心病。',
        '视诊': '一般情况可，无明显异常。',
        '触诊': '脉搏规律，血压稍高。',
        '叩诊': '心界不大。',
        '听诊': '心率70次/分，律齐，无杂音。',
        '检查结果': '心电图运动试验阳性，冠脉造影显示前降支狭窄70%。'
      }
    },
    'car-002': {
      trueDiagnosis: '慢性心力衰竭',
      responses: {
        '主诉': '医生您好，我来做心衰复诊，近期症状与用药想汇报。',
        '现病史': '慢性心衰2年，最近活动耐量下降，夜间偶有憋醒，双下肢轻度水肿。',
        '既往史': '有冠心病、高血压史，心肌梗死后心功能不全。',
        '过敏史': '对ACEI类药物有干咳副作用。',
        '个人史': '已戒烟戒酒，低盐饮食，规律服药。',
        '家族病史': '家族有心血管疾病史。',
        '视诊': '轻度呼吸困难，双下肢轻度凹陷性水肿。',
        '触诊': '心尖搏动向左下移位，肝脏轻度肿大。',
        '叩诊': '心界向左扩大，肺底浊音。',
        '听诊': '心率90次/分，可闻及S3奔马律，肺底湿啰音。',
        '检查结果': '超声心动图显示左室射血分数35%，BNP升高。'
      }
    },
    'car-003': {
      trueDiagnosis: '心房颤动',
      responses: {
        '主诉': '医生您好，我有房颤，想评估是否需要抗凝治疗。',
        '现病史': '房颤诊断1年，平时有心悸，偶尔胸闷，活动耐量稍差。',
        '既往史': '有高血压史，无脑卒中、出血史。',
        '过敏史': '无药物过敏史。',
        '个人史': '不抽烟，偶尔喝酒，年龄68岁。',
        '家族病史': '无特殊家族史。',
        '视诊': '一般情况可，无明显异常。',
        '触诊': '脉搏不规律，血压正常。',
        '叩诊': '心界不大。',
        '听诊': '心律绝对不齐，心率80-120次/分。',
        '检查结果': '心电图确认房颤，超声心动图显示左房扩大。'
      }
    },
    'car-004': {
      trueDiagnosis: '高血压危象',
      responses: {
        '主诉': '医生您好，我血压突然升高伴不适，想尽快处理。',
        '现病史': '2小时前突然头痛、头晕、恶心，测血压200/120mmHg，平时血压控制还可以。',
        '既往史': '高血压10年，平时服用降压药，血压控制在140/90左右。',
        '过敏史': '无药物过敏史。',
        '个人史': '最近工作压力大，睡眠不好，忘记服药2天。',
        '家族病史': '父母都有高血压。',
        '视诊': '患者烦躁不安，面色潮红。',
        '触诊': '脉搏有力，颈动脉搏动明显。',
        '叩诊': '心界稍扩大。',
        '听诊': '心率100次/分，律齐，主动脉瓣区可闻及收缩期杂音。',
        '检查结果': '血压200/120mmHg，眼底检查显示动脉硬化，心电图左室肥厚。'
      }
    },
    'car-005': {
      trueDiagnosis: '急性心包炎',
      responses: {
        '主诉': '医生您好，近期胸痛呼吸受限，怀疑心包问题，想诊断。',
        '现病史': '3天前开始胸痛，尖锐性，深呼吸和平卧时加重，坐位前倾时缓解。',
        '既往史': '2周前有上呼吸道感染，无心脏病史。',
        '过敏史': '无药物过敏史。',
        '个人史': '不抽烟不喝酒，平时身体健康。',
        '家族病史': '无特殊家族史。',
        '视诊': '患者喜坐位前倾，呼吸稍快。',
        '触诊': '心尖搏动减弱。',
        '叩诊': '心界稍扩大。',
        '听诊': '心包摩擦音，心音遥远。',
        '检查结果': '心电图显示ST段弓背向下抬高，超声心动图显示心包积液。'
      }
    },
    'car-006': {
      trueDiagnosis: '深静脉血栓形成',
      responses: {
        '主诉': '医生您好，腿部肿胀疼痛，担心深静脉血栓，想评估。',
        '现病史': '左下肢肿胀疼痛3天，行走时加重，无外伤史，最近长途飞行后出现。',
        '既往史': '无血栓病史，无手术史。',
        '过敏史': '无药物过敏史。',
        '个人史': '长期久坐工作，缺乏运动，最近坐飞机10小时。',
        '家族病史': '无血栓家族史。',
        '视诊': '左下肢明显肿胀，皮肤温度稍高。',
        '触诊': '左小腿压痛，Homans征阳性。',
        '叩诊': '无异常。',
        '听诊': '心肺正常。',
        '检查结果': 'D-二聚体升高，下肢血管超声显示左侧腘静脉血栓。'
      }
    },
    'car-007': {
      trueDiagnosis: '感染性心内膜炎',
      responses: {
        '主诉': '医生您好，最近发热伴心悸，担心感染性心内膜炎。',
        '现病史': '发热2周，体温38-39℃，伴心悸、乏力，食欲差，体重下降。',
        '既往史': '有风湿性心脏病，二尖瓣狭窄，1个月前做过牙科治疗。',
        '过敏史': '对青霉素过敏。',
        '个人史': '不抽烟不喝酒，口腔卫生一般。',
        '家族病史': '无特殊家族史。',
        '视诊': '患者消瘦，面色苍白，指甲下可见线状出血。',
        '触诊': '脾脏肿大，可触及。',
        '叩诊': '心界扩大。',
        '听诊': '心率110次/分，二尖瓣区收缩期杂音，可闻及新出现的舒张期杂音。',
        '检查结果': '血培养阳性，超声心动图显示二尖瓣赘生物，血沉明显升高。'
      }
    }
  };

  return profiles[caseId] || {
    trueDiagnosis: '未知诊断',
    responses: {
      '主诉': '医生您好，我有些不适，想请您帮我看看。',
      '现病史': '症状描述...',
      '既往史': '既往病史...',
      '过敏史': '无特殊过敏史。',
      '个人史': '个人生活史...',
      '家族病史': '家族病史...',
      '视诊': '视诊所见...',
      '触诊': '触诊所见...',
      '叩诊': '叩诊所见...',
      '听诊': '听诊所见...',
      '检查结果': '相关检查结果...'
    }
  };
}

export default function ConsultationChat() {
  const nav = useNavigate();
  const loc = useLocation();
  const params = useParams();
  const caseId = params.caseId ?? (loc.state as any)?.caseId ?? 'case-a';
  const caseTitle = (loc.state as any)?.title ?? '未命名病例';
  const department = (loc.state as any)?.department ?? undefined;
  
  // 根据caseId动态生成患者档案
  const patientProfile = generatePatientProfile(caseId);
  
  // 根据不同病例生成首条患者问候语
  function generateGreeting(id: string, title?: string, dept?: string): string {
    const map: Record<string, string> = {
      // 内科
      'int-001': '医生您好，我最近测量血压偏高，想咨询初诊建议。',
      'int-002': '医生您好，我在进行糖尿病随访，血糖控制方面想请您指导。',
      'int-003': '医生您好，我长期胃部不适，想评估慢性胃炎情况。',
      // 外科
      'sur-001': '医生您好，我做了阑尾手术，今天来做术后复查。',
      'sur-002': '医生您好，最近腹股沟鼓起不适，怀疑疝气，想评估一下。',
      'sur-003': '医生您好，体检发现甲状腺结节，想进一步评估与处理。',
      // 儿科
      'ped-001': '医生您好，孩子这几天发热，想请您帮忙看看。',
      'ped-002': '医生您好，孩子咳嗽迁延不愈，想评估一下原因。',
      'ped-003': '医生您好，孩子最近腹泻，想咨询处理与护理方案。',
      // 妇产科
      'gyn-001': '医生您好，我现在处于孕早期，想了解保健与检查安排。',
      'gyn-002': '医生您好，我来做产后复查，恢复情况想请您评估。',
      'gyn-003': '医生您好，我月经不调，想门诊咨询并检查。',
      // 急诊科
      'eme-001': '医生您好，我突发胸痛不适，想了解急诊处置方案。',
      'eme-002': '医生您好，我有外伤，想做一个初步评估与处理。',
      'eme-003': '医生您好，我出现呼吸困难，请帮忙紧急处理。',
      // 心内科
      'car-001': '医生您好，近来出现胸闷胸痛，怀疑心绞痛，想咨询。',
      'car-002': '医生您好，我来做心衰复诊，近期症状与用药想汇报。',
      'car-003': '医生您好，我有房颤，想评估是否需要抗凝治疗。',
      'car-004': '医生您好，我血压突然升高伴不适，想尽快处理。',
      'car-005': '医生您好，近期胸痛呼吸受限，怀疑心包问题，想诊断。',
      'car-006': '医生您好，腿部肿胀疼痛，担心深静脉血栓，想评估。',
      'car-007': '医生您好，最近发热伴心悸，担心感染性心内膜炎。',
    };
    if (map[id]) return map[id];
    if (title && title !== '未命名病例') return `医生您好，关于“${title}”的情况，想向您咨询。`;
    return '医生您好，我有些不适，想请您帮我看看。';
  }
  // 记录本次研习开始时间
  useEffect(() => {
    try {
      localStorage.setItem(`sessionStart:${caseId}`, String(Date.now()));
    } catch (e) { console.error('记录研习开始时间失败', e); }
  }, [caseId]);
  const [phase, setPhase] = useState<Phase>('INFO_COLLECTION');
  const initialGreeting = generateGreeting(caseId, caseTitle, department);
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'patient', text: initialGreeting }
  ]);
  const [input, setInput] = useState('');
  const [lastApiError, setLastApiError] = useState<string | null>(null);

  // 恢复：API等待时的三点toast显示状态
  const [showReplyToast, setShowReplyToast] = useState(false);
  const [waitingForDiagnosis, setWaitingForDiagnosis] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // 逐字展示：用于首条问候与每次最新病人回复
  const [typingIndex, setTypingIndex] = useState<number | null>(null);
  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    if (!messages.length) return;
    const lastIdx = messages.length - 1;
    const last = messages[lastIdx];
    if (last.role !== 'patient') return; // 仅对病人消息逐字展示

    // 启动逐字展示：首条问候与每次新增的病人最新回复
    setTypingIndex(lastIdx);
    setTypedText('');
    const full = last.text || '';
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setTypedText(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(timer);
        setTypingIndex(null);
      }
    }, 30);

    return () => clearInterval(timer);
  }, [messages]);

  function scrollToBottom(smooth = true) {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    } else if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }



  // 恢复并控制智能提示的显示
  const [showSmartPrompts, setShowSmartPrompts] = useState(false);
  const [smartClickCount, setSmartClickCount] = useState(0);
  const promptTimerRef = useRef<number | null>(null);
  const [awaitingFinalDiagnosis, setAwaitingFinalDiagnosis] = useState(false);
  useEffect(() => {
    return () => { if (promptTimerRef.current) window.clearTimeout(promptTimerRef.current); };
  }, []);

  // 已按需求移除：打开/关闭智能提示时不触发滚动
 
  
  const smartPrompts = useMemo(() => {
    switch (phase) {
      case 'INFO_COLLECTION':
        return ['询问现病史', '询问既往史', '询问过敏史', '进行视诊', '进行触诊', '进行叩诊', '进行听诊'];
      case 'PRELIMINARY_DIAGNOSIS':
        return ['初步诊断：考虑急性上呼吸道感染？'];
      case 'AUXILIARY_VERIFICATION':
        return ['建议进行血常规检查', '建议进行CRP检测', '建议进行胸片检查'];
      case 'TREATMENT_PLAN':
        return ['制定治疗方案', '一般治疗与用药建议'];
      default:
        return [];
    }
  }, [phase]);
  useEffect(() => {
    scrollToBottom(true);
  }, [messages]);



  function addMsg(m: Msg) {
    setMessages((prev) => [...prev, m]);
    setTimeout(() => scrollToBottom(true), 0);
  }
  function addSystem(text: string) { addMsg({ role: 'system', text }); }

  // 外部对话API调用函数（按用户提供的schema：userid/question/history）
  async function callSiliconFlowAPI(doctorText: string): Promise<string> {
    try {
      const userid = localStorage.getItem('username') || 'guest';
      // 构建历史记录：仅保留 doctor->user, patient->assistant，剔除 system
      const normalized = messages
        .map(m => {
          if (m.role === 'doctor') return { role: 'user' as const, content: m.text };
          if (m.role === 'patient') return { role: 'assistant' as const, content: m.text };
          return null;
        })
        .filter(Boolean) as { role: 'user' | 'assistant'; content: string }[];
      
      // 修改逻辑：允许以assistant开头（患者问候语），确保包含完整对话上下文
      const history: { role: 'user' | 'assistant'; content: string }[] = [];
      
      // 如果第一条消息是患者问候语（assistant），保留它
      if (normalized.length > 0 && normalized[0].role === 'assistant') {
        history.push(normalized[0]);
        // 从第二条消息开始处理，期望下一条是user
        let expect: 'user' | 'assistant' = 'user';
        for (let i = 1; i < normalized.length; i++) {
          const msg = normalized[i];
          if (msg.role === expect) {
            history.push(msg);
            expect = expect === 'user' ? 'assistant' : 'user';
          } else if (msg.role === 'user') {
            // 发现新的用户消息，重新开始配对
            history.push(msg);
            expect = 'assistant';
          } // 当期望用户时遇到assistant则跳过，保证交替
        }
      } else {
        // 原有逻辑：以user开头的情况
        while (normalized.length && normalized[0].role !== 'user') normalized.shift();
        let expect: 'user' | 'assistant' = 'user';
        for (const msg of normalized) {
          if (msg.role === expect) {
            history.push(msg);
            expect = expect === 'user' ? 'assistant' : 'user';
          } else if (msg.role === 'user') {
            // 发现新的用户消息，重新开始配对
            history.push(msg);
            expect = 'assistant';
          } // 当期望用户时遇到assistant则跳过，保证交替
        }
      }
      
      // 去掉尾部未配对的用户消息（当前问题由 question 字段传入）
      if (history.length && history[history.length - 1].role === 'user') {
        history.pop();
      }

      // 调试输出：显示对话历史内容
      console.log('=== 对话历史调试信息 ===');
      console.log('当前messages:', messages);
      console.log('构建后的history:', history);
      console.log('当前问题:', doctorText);
      console.log('病例信息:', { caseId, phase, caseTitle, department });
      console.log('患者档案:', patientProfile);
      console.log('========================');

      const payload = { 
        userid, 
        question: doctorText, 
        history,
        caseId,
        patientProfile: {
          trueDiagnosis: patientProfile.trueDiagnosis,
          responses: patientProfile.responses
        },
        phase,
        caseTitle,
        department
      };

      const response = await fetch('/aiChat', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }

      const data = await response.json();
      console.log('对话接口返回:', data);
      if (data?.status === 200 && typeof data?.answer === 'string') {
        setLastApiError(null);
        return data.answer;
      }
      const reason = typeof data?.answer === 'string' ? data.answer : '服务返回非200状态';
      throw new Error(reason);
    } catch (error) {
      console.error('API调用错误:', error);
      setLastApiError(error instanceof Error ? error.message : String(error));
      // 如果API调用失败，回退到原有的模拟回复逻辑
      return generateFallbackResponse(doctorText);
    }
  }

  // 备用回复逻辑（当API调用失败时使用）
  function generateFallbackResponse(doctorText: string): string {
    const lowerText = doctorText.toLowerCase();
    if (lowerText.includes('现病史')) return patientProfile.responses['现病史'];
    if (lowerText.includes('既往史')) return patientProfile.responses['既往史'];
    if (lowerText.includes('过敏')) return patientProfile.responses['过敏史'];
    if (lowerText.includes('个人史') || lowerText.includes('生活习惯')) return patientProfile.responses['个人史'];
    if (lowerText.includes('家族')) return patientProfile.responses['家族病史'];
    if (lowerText.includes('视诊')) return patientProfile.responses['视诊'];
    if (lowerText.includes('触诊')) return patientProfile.responses['触诊'];
    if (lowerText.includes('叩诊')) return patientProfile.responses['叩诊'];
    if (lowerText.includes('听诊')) return patientProfile.responses['听诊'];
    if (lowerText.includes('检查') || lowerText.includes('化验')) return patientProfile.responses['检查结果'];
    if (phase === 'PRELIMINARY_DIAGNOSIS') return '好的医生，根据您说的，我大概是什么问题呢？';
    if (phase === 'TREATMENT_PLAN') return '好的，谢谢医生，我会按您说的做。';
    return '嗯，您继续问吧。';
  }

  // 新增：完成诊断按钮的处理逻辑
  function handleCompleteDiagnosisClick() {
    addMsg({ role: 'system', text: '请给出你的最终诊断与治疗方案（不少于两句）' });
    setAwaitingFinalDiagnosis(true);
  }

  async function handleSend(prompt?: string) {
    // 支持从智能提示触发时不显示等待气泡
    const suppressWaiting = (arguments.length > 1 && typeof arguments[1] === 'object' && (arguments[1] as any)?.suppressWaiting) === true;
    const text = (prompt || input).trim();
     if (!text) return;
     setInput('');
     addMsg({ role: 'doctor', text });

     // 完成诊断后用户回答拦截：医生给出最终答案后提示查看结果
     if (awaitingFinalDiagnosis) {
        setAwaitingFinalDiagnosis(false);
        addMsg({ role: 'system', text: '您已完成模拟诊断啦，请查看你的得分和复盘把，点击查看' });
        return;
      }

     // 如果在初步判断阶段且等待诊断回答
     if (phase === 'PRELIMINARY_DIAGNOSIS' && waitingForDiagnosis) {
       const isCorrect = checkDiagnosis(text);
       setWaitingForDiagnosis(false);

       if (isCorrect) {
        // 诊断正确，立即回复并进入治疗阶段
        addMsg({ role: 'patient', text: '是的医生，您诊断得很准确！那我应该怎么治疗呢？' });
         setTimeout(() => {
           setPhase('TREATMENT_PLAN');
         }, 500);
         return;
       } else {
        // 诊断不准确，立即提示并进入辅助验证
        addMsg({ role: 'patient', text: '嗯...我觉得可能还需要做一些检查来确认一下，医生您觉得需要做什么检查呢？' });
         setTimeout(() => {
           setPhase('AUXILIARY_VERIFICATION');
         }, 500);
         return;
       }
     }

     // 使用外部对话API生成患者回复（失败则自动回退到本地模拟回复），智能提示触发也展示等待 toast
    const replyPromise = callSiliconFlowAPI(text);
    if (!suppressWaiting) setShowReplyToast(true);
    const reply = await replyPromise;
    if (!suppressWaiting) setShowReplyToast(false);
    addMsg({ role: 'patient', text: reply });
    }

  async function handleNextPhase() {
    const next = phaseConfig[phase].next;
    if (next) {
      setPhase(next);
      // 移除阶段提示，不再插入系统阶段变更信息

      // 如果进入初步判断阶段，AI主动询问诊断（立即显示患者话术）
      if (next === 'PRELIMINARY_DIAGNOSIS') {
        addMsg({ role: 'patient', text: '医生好，您觉得我得的是什么病呢？' });
        setWaitingForDiagnosis(true);
      }
    } else {
      // End of consultation, navigate to summary/scoring page
      nav('/result', { state: { caseId, title: caseTitle, department } });
    }
  }

  // 检查诊断是否准确
  function checkDiagnosis(doctorText: string): boolean {
    const lowerText = doctorText.toLowerCase();
    const trueDiagnosis = patientProfile.trueDiagnosis.toLowerCase();
    const keywords = ['急性', '上呼吸道', '感染', '呼吸道感染', '上感'];
    return keywords.some(keyword => lowerText.includes(keyword)) ||
           lowerText.includes(trueDiagnosis);
  }

  // 智能提示触发函数
  function triggerSmartPrompt() {
    setShowSmartPrompts(true);
    setSmartClickCount((c) => c + 1);
    if (promptTimerRef.current) window.clearTimeout(promptTimerRef.current);
    // 自动隐藏智能提示，回归旧版交互
    promptTimerRef.current = window.setTimeout(() => {
      setShowSmartPrompts(false);
    }, 5000);
  }

  function handleSmartPromptAction(promptText: string) {
    // 智能提示触发同样显示等待三点toast
    handleSend(promptText);
    setShowSmartPrompts(false);
  }

  function renderSmartPrompts() {
    const step = smartClickCount;

    if (!showSmartPrompts) return null;

    let title = '';
    let buttons: { text: string; action: () => void; }[] = [];

    switch (step) {
      case 1:
        title = '您可以询问病史唷';
        buttons = [
          { text: '询问个人病史', action: () => handleSmartPromptAction('告诉一下你有没有个人病史吧。') },
        ];
        break;
      case 2:
        title = '建议您对病人进行体格检查呀';
        buttons = ['视诊', '触诊', '叩诊', '听诊'].map(item => ({ text: item, action: () => handleSmartPromptAction(`进行${item}`) }));
        break;
      case 3:
        title = '您可以对病人进行辅助检查';
        buttons = [
          { text: '进行辅助检查', action: () => handleSmartPromptAction('进行辅助检查') },
        ];
        break;
      case 4:
        title = '好像您已经基本完成了问诊过程，请告诉我你的最终答案吧，请点击完成诊断';
        buttons = [
          { text: '完成诊断', action: () => { setShowSmartPrompts(false); handleCompleteDiagnosisClick(); } },
        ];
        break;
      default:
        title = '我已经把知道的都告诉你啦，您可以直接完成诊断啦~';
        break;
    }

    return (
      <div className="bg-white border border-gray-200 shadow-lg rounded-lg p-3 w-full sm:w-[30rem] max-h-80 mb-2 mr-auto overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-semibold text-gray-700">{title}</p>
          <button
            onClick={() => setShowSmartPrompts(false)}
            className="text-xs text-gray-500 hover:text-gray-800"
          >
            关闭
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {buttons.map((btn, idx) => (
            <button
              key={idx}
              onClick={btn.action}
              className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-md text-sm hover:bg-blue-200 transition-colors"
            >
              {btn.text}
            </button>
          ))}
        </div>
      </div>
    );
  }


  return (
    <div 
      className="min-h-screen bg-[#F0F2FF] flex flex-col font-sans"
    >
      <header className="bg-white sticky top-0 z-10 p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <button onClick={() => nav('/')} className="p-2 rounded-md hover:bg-gray-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="font-bold text-lg">模拟问诊</span>
        </div>
      </header>

      <main ref={listRef} className="relative flex-1 overflow-auto p-4 space-y-6 pb-28">
        <div className="text-center my-2">
          <div className="inline-block text-gray-500 text-sm">
            演练开始了，开始问诊吧，如果需要提示可以点击智能提示~。
          </div>
        </div>
        
        {messages.map((m, i) => {
          const isDoctor = m.role === 'doctor';
          const isSystem = m.role === 'system';
          const isTyping = (typingIndex === i && m.role === 'patient');
          const shownText = isTyping ? typedText : m.text;

          if (isSystem) {
            const hasLink = m.text.includes('点击查看');
            return (
              <div key={i} className="text-center my-4">
                {hasLink ? (
                  <>
                    {m.text.split('点击查看')[0]}
                    <span className="text-blue-600 cursor-pointer" onClick={() => nav('/result', { state: { caseId, title: caseTitle, department } })}>点击查看</span>
                  </>
                ) : m.text}
              </div>
            );
          }

          return (
            <div key={i} className={`flex items-start gap-3 ${isDoctor ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] sm:max-w-lg lg:max-w-xl px-5 py-4 rounded-2xl shadow-md ${isDoctor ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-900 rounded-bl-none'}`}>
                <p className="text-base leading-relaxed">
                  {shownText}
                </p>
                {m.role === 'patient' && m.text.includes("检查报告") && 
                    <div className="mt-3 flex items-center justify-between text-sm">
                        <span>如有相关检查报告，可点击上传</span>
                        <button className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded-lg hover:bg-gray-300">上传</button>
                    </div>
                }
              </div>
            </div>
          );
        })}
        <div ref={endRef} className="h-0" aria-hidden></div>
      </main>

      {/* 等待回复三点toast（显示在footer上方） */}
      {showReplyToast && (
        <div className="px-4 pb-2">
          <div className="inline-flex items-center gap-1.5 bg-white/90 border border-gray-200 rounded-full px-3 py-2 shadow-sm">
            <span className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
            <span className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
          </div>
        </div>
      )}

      <footer className="bg-white/90 backdrop-blur-lg border-t border-gray-100 p-4 sticky bottom-0 rounded-t-2xl shadow-2xl">
        <div className="flex justify-start items-center mb-4 gap-2">
            <button onClick={triggerSmartPrompt} className="bg-white border border-gray-200 text-gray-800 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm hover:bg-gray-50 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zM5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" /></svg>
                智能提示
            </button>
            <button onClick={handleCompleteDiagnosisClick} className="bg-green-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg hover:bg-green-700">
                完成诊断
            </button>
        </div>

        {renderSmartPrompts()}
        {lastApiError && (
          <div className="mb-2 text-red-600 text-xs bg-red-50 border border-red-200 rounded-md p-2">
            对话接口错误：{lastApiError}
          </div>
        )}
        
        <div className="flex items-center gap-2 bg-gray-100 rounded-full p-2">
          <button className="p-2">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v2a3 3 0 01-3 3z" /></svg>
          </button>
          <input 
            type="text" 
            placeholder="有什么健康问题告诉我吗"
            className="flex-1 w-full bg-transparent focus:outline-none text-base"
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && handleSend()} 
          />
          <button className="p-2">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          </button>
          <button className="px-3 py-1.5 bg-blue-600 text-white rounded-full text-xs hover:bg-blue-700" onClick={() => handleSend()}>
            发送
          </button>
        </div>
      </footer>
    </div>
  );
}