#!/bin/bash

# Цвета
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🔐 Testing signatureCreateStatement_forIndividual.docx${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

CARBONE_URL="http://localhost:3001/api/v1/generate"
TEMPLATE_PATH="./templates/signature/signatureCreateStatement_forIndividual.docx"
RESULT_FILE="./signatureCreateStatement-TEST.pdf"

# Проверки
echo -n "✓ Checking carbone-service... "
if ! curl -s http://localhost:3001/api/v1/health >/dev/null 2>&1; then
    echo -e "${RED}✗ NOT RUNNING${NC}"
    echo ""
    echo "Start it: npm run dev"
    exit 1
fi
echo -e "${GREEN}OK${NC}"

echo -n "✓ Checking template... "
if [ ! -f "$TEMPLATE_PATH" ]; then
    echo -e "${RED}✗ NOT FOUND${NC}"
    echo ""
    echo "Template: $TEMPLATE_PATH"
    exit 1
fi
echo -e "${GREEN}OK${NC}"

echo ""
echo -e "${YELLOW}📄 Template: signatureCreateStatement_forIndividual.docx${NC}"
echo -e "${YELLOW}👤 Person: Садыков Арман Болатұлы${NC}"
echo -e "${YELLOW}📅 Date: 20.11.2025${NC}"
echo ""

# Полные реальные данные для заявления на создание ЭЦП (физлицо)
# На основе типичных полей для таких документов
DATA=$(cat <<'EOF'
{
  "fullName": "Садыков Арман Болатұлы",
  "name": "Арман",
  "firstName": "Арман",
  "surname": "Садыков",
  "lastName": "Садыков",
  "middleName": "Болатұлы",
  "patronymic": "Болатұлы",
  "fatherName": "Болат",

  "iin": "890220456789",
  "IIN": "890220456789",

  "dateOfBirth": "20.02.1989",
  "birthDate": "20.02.1989",
  "birthDateFull": "20 февраля 1989 года",
  "birthDateKZ": "1989 жылғы 20 ақпаны",

  "date": "20.11.2025",
  "currentDate": "20.11.2025",
  "createdDate": "20.11.2025",
  "created": "20.11.2025",
  "documentDate": "20.11.2025",
  "applicationDate": "20.11.2025",
  "statementDate": "20.11.2025",

  "dateKZ": "2025 жылғы 20 қарашасы",
  "currentDateKZ": "2025 жылғы 20 қарашасы",
  "dateFormatted": "20 ноября 2025 года",
  "dateFull": "20 ноября 2025 года",

  "city": "Шымкент",
  "cityName": "Шымкент",
  "cityKZ": "Шымкент",
  "region": "Шымкент қаласы",
  "address": "Шымкент қаласы, Абай ауданы, Тәуелсіздік даңғылы 25",
  "fullAddress": "Шымкент қаласы, Абай ауданы, Тәуелсіздік даңғылы 25, 12 пәтер",
  "residenceAddress": "Шымкент қаласы, Абай ауданы, Тәуелсіздік даңғылы 25, 12 пәтер",

  "phone": "+7 (778) 890-12-34",
  "phoneNumber": "+7 (778) 890-12-34",
  "mobilePhone": "+7 (778) 890-12-34",
  "contactPhone": "+7 (778) 890-12-34",

  "email": "a.sadykov@example.kz",
  "emailAddress": "a.sadykov@example.kz",
  "contactEmail": "a.sadykov@example.kz",

  "documentType": "Удостоверение личности",
  "documentTypeKZ": "Жеке куәлік",
  "idDocumentType": "Удостоверение личности",

  "documentNumber": "123456789",
  "idNumber": "123456789",
  "passportNumber": "123456789",

  "documentIssueDate": "15.03.2020",
  "issueDate": "15.03.2020",
  "idIssueDate": "15.03.2020",

  "documentIssuedBy": "МВД РК",
  "issuedBy": "МВД РК",
  "idIssuedBy": "МВД РК",

  "certificateType": "Для физического лица",
  "certificateTypeKZ": "Жеке тұлға үшін",
  "certType": "Для физического лица",

  "certificatePurpose": "Для использования в электронных услугах",
  "purpose": "Для использования в электронных услугах",
  "certificateUsage": "Электронная подпись документов",

  "validity": "2 года",
  "validityPeriod": "2 года",
  "certificateValidity": "2 года",

  "validFrom": "20.11.2025",
  "validTo": "20.11.2027",
  "expiryDate": "20.11.2027",
  "certificateValidFrom": "20.11.2025",
  "certificateValidTo": "20.11.2027",

  "applicantType": "Физическое лицо",
  "applicantTypeKZ": "Жеке тұлға",

  "signature": "Садыков А.Б.",
  "applicantSignature": "Садыков А.Б.",

  "bankName": "АО «ForteBank»",
  "bankNameKZ": "«ForteBank» АҚ",

  "branch": "Шымкентский филиал",
  "branchName": "Шымкентский филиал",

  "applicationNumber": "ЭЦП-2025-11-001",
  "statementNumber": "ЭЦП-2025-11-001",
  "registrationNumber": "ЭЦП-2025-11-001"
}
EOF
)

echo -e "${BLUE}📊 Data being sent:${NC}"
echo "$DATA" | python3 -m json.tool 2>/dev/null || echo "$DATA"
echo ""

echo -e "${BLUE}📤 Sending request to carbone-service...${NC}"
echo ""

# Отправляем запрос
HTTP_CODE=$(curl -X POST $CARBONE_URL \
    -F "template=@$TEMPLATE_PATH" \
    -F "data=$DATA" \
    --output "$RESULT_FILE" \
    --silent \
    --show-error \
    --write-out "%{http_code}")

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"

if [ "$HTTP_CODE" = "200" ]; then
    size_bytes=$(stat -f%z "$RESULT_FILE" 2>/dev/null || stat -c%s "$RESULT_FILE" 2>/dev/null)
    size_human=$(ls -lh "$RESULT_FILE" | awk '{print $5}')

    if [ $size_bytes -lt 1000 ]; then
        echo -e "${RED}✗ FAILED - File too small${NC}"
        echo ""
        echo "Error:"
        cat "$RESULT_FILE"
        exit 1
    fi

    echo -e "${GREEN}✅ SUCCESS!${NC}"
    echo ""
    echo "📄 Generated: $RESULT_FILE"
    printf '📏 Size: %s (%s bytes)\n' "$size_human" "$size_bytes"
    echo ""

    echo -e "${BLUE}💡 Opening PDF...${NC}"
    if command -v open &> /dev/null; then
        open "$RESULT_FILE"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "$RESULT_FILE"
    fi

    echo ""
    echo -e "${GREEN}✅ Please verify in the PDF:${NC}"
    echo ""
    echo "   Personal Information:"
    echo "   ✓ ФИО: Садыков Арман Болатұлы"
    echo "   ✓ ИИН: 890220456789"
    echo "   ✓ Дата рождения: 20.02.1989"
    echo "   ✓ Адрес: Шымкент қаласы, Абай ауданы, Тәуелсіздік даңғылы 25, 12 пәтер"
    echo ""
    echo "   Contact Information:"
    printf '   ✓ Телефон: +7 (778) 890-12-34\n'
    echo "   ✓ Email: a.sadykov@example.kz"
    echo ""
    echo "   Document Information:"
    echo "   ✓ Тип документа: Удостоверение личности"
    echo "   ✓ Номер: 123456789"
    echo "   ✓ Дата выдачи: 15.03.2020"
    echo ""
    echo "   Application Information:"
    echo "   ✓ Дата заявления: 20.11.2025"
    echo "   ✓ Номер: ЭЦП-2025-11-001"
    printf '   ✓ Срок действия: 2 года (до 20.11.2027)\n'
    echo ""
    echo -e "${YELLOW}❓ Check:${NC}"
    echo "   • Are there spaces between words?"
    echo "   • Is all text filled correctly?"
    echo "   • Does the layout look correct?"
    echo ""

    exit 0
else
    echo -e "${RED}✗ FAILED - HTTP $HTTP_CODE${NC}"
    echo ""
    if [ -f "$RESULT_FILE" ]; then
        echo "Response:"
        cat "$RESULT_FILE"
    fi
    exit 1
fi