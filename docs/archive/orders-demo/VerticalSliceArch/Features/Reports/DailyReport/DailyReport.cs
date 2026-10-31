using VerticalSliceArch.Common;

namespace VerticalSliceArch.Features.Reports.DailyReport;

// Statik qabıq bütün feature-lərdə eyni quruluşu görməyə kömək edir.
public static class DailyReport
{
    // Parametr lazım deyil: hesabat hazırkı bazanı oxuyur.
    public class Handler
    {
        private readonly FakeDatabase database;

        public Handler(FakeDatabase database)
        {
            this.database = database;
        }

        public void Handle()
        {
            // Demo üçün gündəlik hesabat hər dəqiqə çağırılır.
            Console.WriteLine($"Hesabat: hazırda {database.GetAll().Count} sifariş var.");
        }
    }

    public static void MapEndpoint(WebApplication app)
    {
        // Ortaq şablonu saxlayırıq, amma bu job-un HTTP endpoint-i yoxdur.
        // Handler-i Program.cs-də planlaşdırılan Hangfire job-u çağırır.
    }
}
