using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace RecruitmentGiganci.Server.Models;

public partial class RecruitmentgigaContext : DbContext
{
    public RecruitmentgigaContext()
    {
    }

    public RecruitmentgigaContext(DbContextOptions<RecruitmentgigaContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Chat> Chats { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlServer("Data Source=sql.bsite.net\\MSSQL2016;Initial Catalog=recruitmentgiga_;Persist Security Info=True;User ID=recruitmentgiga_;Password=RecruitmentGiga;Trust Server Certificate=True");
    // This obviously shouldn't be hardcoded like this in production code
    // The connection string should be stored securely, for example in environment variables or a secure vault
    // For the sake of this recruitment task, this will suffice
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Chat>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Chats__3214EC070991E92C");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.Name).HasMaxLength(100);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
