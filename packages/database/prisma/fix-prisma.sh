#!/bin/bash
# fix-prisma.sh - Automatically fix Prisma schema errors

set -e  # Exit on error

SCHEMA_FILE="./schema.prisma"
BACKUP_FILE="$SCHEMA_FILE.backup.$(date +%Y%m%d_%H%M%S)"

echo "🔧 Prisma Schema Fixer"
echo "======================"

# Create backup
echo "📋 Creating backup: $BACKUP_FILE"
cp "$SCHEMA_FILE" "$BACKUP_FILE"

echo "🚀 Applying fixes..."

# 1. Add previewFeatures to generator
if ! grep -q "previewFeatures" "$SCHEMA_FILE"; then
    echo "✓ Adding previewFeatures..."
    sed -i '/generator client {/a\  previewFeatures = ["fullTextIndex"]' "$SCHEMA_FILE"
fi

# 2. Comment out fulltext indexes
echo "✓ Commenting out fulltext indexes..."
sed -i 's/@@fulltext/\/\/ @@fulltext/g' "$SCHEMA_FILE"

# 3. Fix Dispute bookingId
echo "✓ Making bookingId unique in Dispute model..."
sed -i '/model Dispute {/,/^}/ s/bookingId\s*String/bookingId           String        @unique/' "$SCHEMA_FILE"

# 4. Add missing User relations
echo "✓ Adding missing relations to User model..."
sed -i '/notifications       Notification\[\]/a\
  disputes            Dispute\[\]            @relation("DisputeOpener")\
  disputesAgainst     Dispute\[\]            @relation("DisputeDefendant")\
  payments            Payment\[\]\
  bookingGuarantors   BookingGuarantor\[\]   @relation("GuarantorBookings")\
  agentVerifications  AgentVerification\[\]' "$SCHEMA_FILE"

# 5. Add missing Listing relation
echo "✓ Adding missing relation to Listing model..."
sed -i '/availabilitySlots   AvailabilitySlot\[\]/a\
  reviews             Review\[\]            @relation("ListingReviews")' "$SCHEMA_FILE"

# 6. Fix relation names
echo "✓ Fixing relation names..."
# BookingGuarantor
sed -i '/guarantor\s*User.*@relation.*guarantorId/s/@relation/@relation("GuarantorBookings",/' "$SCHEMA_FILE"
# Payment
sed -i '/user\s*User.*@relation.*userId.*Payment/s/@relation/@relation("PaymentUser",/' "$SCHEMA_FILE"
# DisputeMessage
sed -i '/user\s*User.*@relation.*userId.*DisputeMessage/s/@relation/@relation("DisputeMessageUser",/' "$SCHEMA_FILE"
# Agent
sed -i '/user\s*User.*@relation.*userId.*onDelete.*Cascade.*Agent/s/@relation/@relation("AgentUser",/' "$SCHEMA_FILE"
# AgentVerification
sed -i '/user\s*User.*@relation.*userId.*AgentVerification/s/@relation/@relation("AgentVerificationUser",/' "$SCHEMA_FILE"

# 7. Add listing to Review model
echo "✓ Adding listing relation to Review model..."
sed -i '/reviewee\s*User.*@relation.*"Reviewee"/a\
  listing             Listing?  @relation("ListingReviews", fields: [bookingId], references: [id])' "$SCHEMA_FILE"

echo ""
echo "✅ All fixes applied!"
echo ""
echo "📁 Backup saved to: $BACKUP_FILE"
echo ""
echo "📋 Validation:"
echo "--------------"
npx prisma validate || echo "Validation failed - please check the schema manually"

echo ""
echo "🚀 Next steps:"
echo "1. npx prisma generate"
echo "2. Test your application"